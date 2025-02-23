import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

class ContextSplitter {
  private contexts: string[];
  private index: number;
  private overlap: number;

  constructor(context: string, overlap: number = 2) {
    this.contexts = context.split("\n-----SPLIT-----\n").map((c) => c.trim());
    this.index = 0;
    this.overlap = overlap;
  }

  get length(): number {
    return this.contexts.length - this.overlap;
  }

  getItem(index: number): string {
    return this.contexts.slice(index, index + this.overlap + 1).join("\n");
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

export interface QuestionGeneratorOptions {
  numberOfQuestions: number;
  context: string;
  overlap?: number;
  printQuestions?: boolean;
}

export interface QuestionGeneratorResult {
  questions: InformationQuestion[];
  stats: {
    inputTokens: number;
    outputTokens: number;
    costInput: number;
    costOutput: number;
    totalCost: number;
  };
}

export async function generateQuestions({
  numberOfQuestions,
  context,
  overlap = 2,
  printQuestions = false,
}: QuestionGeneratorOptions): Promise<QuestionGeneratorResult> {
  const systemPrompt = `You are a history teacher preparing questions for your students.
Your task is to create challenging but fair questions based on the provided context.
Make sure the questions test understanding rather than mere memorization.`;

  const contextSplitter = new ContextSplitter(context, overlap);
  const questions: z.infer<typeof InformationQuestion>[] = [];
  const messages: string[] = [];
  let inputTokens = 0;
  let outputTokens = 0;
  const contextLength = contextSplitter.length;

  for (let i = 0; i < numberOfQuestions; i++) {
    try {
      const contextIndex = Math.floor((i * contextLength) / numberOfQuestions);
      const contextBatches = await questionToBatches(
        contextSplitter.getItem(contextIndex),
        2
      );
      const context = "CONTEXT:\n" + contextBatches.join("\n");

      const completion = await openai.beta.chat.completions.parse({
        model: "ft:gpt-4o-2024-08-06:umstad::AvydhEM5",
        messages: [
          { role: "system", content: systemPrompt + context },
          {
            role: "user",
            content:
              "Write a question using the summary, THIS IS THE IMPORTANT PART ASK SOMETHING FROM THIS, CONTEXT ABOVE IS JUSt HELPING: " +
              contextSplitter.getItem(contextIndex),
          },
        ],
        response_format: zodResponseFormat(InformationQuestion, "question"),
      });

      const message = completion.choices[0].message;
      const parsed = message.parsed;

      inputTokens += completion.usage?.prompt_tokens || 0;
      outputTokens += completion.usage?.completion_tokens || 0;

      questions.push(parsed);
      messages.push(message.content);

      if (printQuestions) {
        console.log(parsed);
      }
    } catch (error) {
      console.error("Error preparing question:", error);
      console.error("Messages:", messages);
    }
  }

  const costInput = (inputTokens * 0.15) / 1000000;
  const costOutput = (outputTokens * 0.6) / 1000000;

  return {
    questions,
    stats: {
      inputTokens,
      outputTokens,
      costInput,
      costOutput,
      totalCost: costInput + costOutput,
    },
  };
}
