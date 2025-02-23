import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { generateQuestions } from "@/lib/questionGenerator";

const prisma = new PrismaClient();

function generateDummyQuestions(category: string, contexts: string[]) {
  const questions = [];
  for (let i = 0; i < 10; i++) {
    const question = `${contexts[i]} konusu ile ilgili örnek soru ${i + 1}?`;
    const answers = [
      `${contexts[i]} - Cevap A örneği ${i + 1}`,
      `${contexts[i]} - Cevap B örneği ${i + 1}`,
      `${contexts[i]} - Cevap C örneği ${i + 1}`,
      `${contexts[i]} - Cevap D örneği ${i + 1}`,
      `${contexts[i]} - Cevap E örneği ${i + 1}`,
    ];
    const correctAnswer = Math.floor(Math.random() * 5);

    questions.push({
      context: contexts[i],
      information: contexts[i],
      question,
      answers,
      correctAnswer,
      preferredQuestion: question,
      preferredAnswers: answers,
      preferredCorrectAnswer: correctAnswer,
      score: 1,
      category: category,
    });
  }
  return questions;
}

export async function GET(request: Request) {
  const cookieStore = cookies();
  const authCookie = cookieStore.get("auth");

  if (!authCookie || authCookie.value !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  if (!category) {
    return NextResponse.json(
      { error: "Category is required" },
      { status: 400 }
    );
  }

  try {
    const questions = await prisma.question.findMany({
      where: {
        category: category,
        checked: false,
      },
    });
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const authCookie = cookieStore.get("auth");

  if (!authCookie || authCookie.value !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const body = await request.json();
  const contexts =
    body.contexts || [...Array(5).keys()].map((i) => `Bağlam ${i + 1}`);

  if (!category) {
    return NextResponse.json(
      { error: "Category is required" },
      { status: 400 }
    );
  }

  try {
    const result = await generateQuestions({
      numberOfQuestions: contexts.length * 2, // Generate 2 questions per context
      context: contexts.join("\n-----SPLIT-----\n"),
      overlap: 2,
      printQuestions: process.env.NODE_ENV === "development",
    });

    const createdQuestions = await prisma.question.createMany({
      data: result.questions.map((q, i) => ({
        context: contexts[Math.floor(i / 2)], // Associate each question with its context
        information: contexts[Math.floor(i / 2)],
        question: q.question,
        answers: [
          q.correct_answer,
          "Option B",
          "Option C",
          "Option D",
          "Option E",
        ],
        correctAnswer: 0, // Correct answer is always the first one
        preferredQuestion: q.question,
        preferredAnswers: [
          q.correct_answer,
          "Option B",
          "Option C",
          "Option D",
          "Option E",
        ],
        preferredCorrectAnswer: 0,
        score: 1,
        category: category,
        checked: false,
      })),
    });

    if (process.env.NODE_ENV === "development") {
      console.log("Generation stats:", result.stats);
    }

    return NextResponse.json({
      message: "Questions generated successfully",
      count: createdQuestions.count,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
