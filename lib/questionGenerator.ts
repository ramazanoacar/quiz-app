import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { SYSTEM_PROMPT } from "@/lib/prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

class ContextSplitter {
  private contexts: string[];

  constructor(context: string) {
    this.contexts = context.split("\n-----SPLIT-----\n").map((c) => c.trim());
  }

  get length(): number {
    return this.contexts.length;
  }

  getItem(index: number): string {
    return this.contexts[index];
  }
}

const InformationQuestion = z.object({
  question: z.string(),
  correct_answer: z.string(),
});

type InformationQuestion = z.infer<typeof InformationQuestion>;

async function toVector(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });
  return response.data[0].embedding;
}

async function questionToBatches(
  question: string,
  n: number
): Promise<string[]> {
  const index = pinecone.index("general-context");
  const vector = await toVector(question);

  const queryResponse = await index.query({
    vector,
    topK: n,
    includeMetadata: true,
  });

  return queryResponse.matches.map((match) => match.metadata?.text as string);
}

type QuestionGeneratorOutput = {
  question: InformationQuestion;
  additionalContext: string;
  information: string;
};

export async function generateQuestion(
  information: string
): Promise<QuestionGeneratorOutput> {
  const printQuestions = process.env.NODE_ENV === "development";
  const question: z.infer<typeof InformationQuestion> = {
    question: "",
    correct_answer: "",
  };
  let additionalContext: string;

  try {
    const contextBatches = await questionToBatches(information, 2);
    additionalContext = "CONTEXT:\n" + contextBatches.join("\n");
    console.log(new Date().toISOString());
    const completion = await openai.beta.chat.completions.parse({
      model: "ft:gpt-4o-2024-08-06:umstad::AvydhEM5",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT + "\n\n" + additionalContext,
        },
        {
          role: "user",
          content:
            "Write a question using the summary, THIS IS THE IMPORTANT PART ASK SOMETHING FROM THIS, CONTEXT ABOVE IS JUSt HELPING: " +
            information,
        },
      ],
      response_format: zodResponseFormat(InformationQuestion, "question"),
    });
    console.log(new Date().toISOString());
    const message = completion.choices[0].message;
    const parsed = message.parsed;

    question.question = parsed.question;
    question.correct_answer = parsed.correct_answer;

    if (printQuestions) {
      console.log(parsed);
    }
  } catch (error) {
    console.error("Error preparing question:", error);
  }

  return {
    question: question,
    additionalContext,
    information,
  };
}
