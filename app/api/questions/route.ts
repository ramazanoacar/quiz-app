import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { generateQuestion } from "@/lib/questionGenerator";

const prisma = new PrismaClient();

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
      orderBy: {
        addedAt: "desc",
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
  const contexts: string[] =
    body.contexts || [...Array(5).keys()].map((i) => `Bağlam ${i + 1}`);

  if (!category) {
    return NextResponse.json(
      { error: "Category is required" },
      { status: 400 }
    );
  }

  try {
    const result = await Promise.all(contexts.map(generateQuestion));

    const createdQuestions = await prisma.question.createMany({
      data: result.map((q, i) => ({
        context: contexts[Math.floor(i / 2)],
        information: contexts[Math.floor(i / 2)],
        question: q.question,
        answers: [
          q.correct_answer,
          "Option B",
          "Option C",
          "Option D",
          "Option E",
        ],
        correctAnswer: 0,
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
        addedAt: new Date(),
      })),
    });

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
