import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Dummy questions generator
function generateDummyQuestions(category: string) {
  const questions = [];
  const topics = {
    anadolu_selcuklu: "Anadolu Selçuklu",
    beylikten_devlete: "Osmanlı Kuruluş",
    degisen_dunya: "Osmanlı Siyaseti",
    degisim_cagi: "Osmanlı Modernleşme",
    deka_dunya: "Osmanlı Dünya Gücü",
    ilk_cag: "İlk Çağ",
    turk_dunyasi: "Türk Dünyası",
    islam_medeniyeti: "İslam Medeniyeti",
    turk_islam: "Türk İslam",
  };

  const topicName = topics[category as keyof typeof topics] || category;

  for (let i = 0; i < 10; i++) {
    const question = `${topicName} konusu ile ilgili örnek soru ${i + 1}?`;
    const answers = [
      `${topicName} - Cevap A örneği ${i + 1}`,
      `${topicName} - Cevap B örneği ${i + 1}`,
      `${topicName} - Cevap C örneği ${i + 1}`,
      `${topicName} - Cevap D örneği ${i + 1}`,
      `${topicName} - Cevap E örneği ${i + 1}`,
    ];
    const correctAnswer = Math.floor(Math.random() * 5);

    questions.push({
      context: `${topicName} konusu ile ilgili genel bilgi`,
      information: `${topicName} konusu ile ilgili özel bilgi`,
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
  // Check authentication
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
  // Check authentication
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
    const newQuestions = generateDummyQuestions(category);
    const createdQuestions = await prisma.question.createMany({
      data: newQuestions.map((q) => ({
        ...q,
        checked: false,
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
