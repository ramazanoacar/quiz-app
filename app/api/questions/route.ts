import { NextResponse } from 'next/server';

// Dummy questions generator
function generateDummyQuestions(category: string) {
  const questions = [];
  for (let i = 0; i < 10; i++) {
    questions.push({
      id: `q${i}`,
      question: `Sample ${category} question ${i + 1}?`,
      answers: [
        `Answer option A for question ${i + 1}`,
        `Answer option B for question ${i + 1}`,
        `Answer option C for question ${i + 1}`,
        `Answer option D for question ${i + 1}`,
        `Answer option E for question ${i + 1}`,
      ],
      correctAnswer: Math.floor(Math.random() * 5),
      score: 1,
      isWrong: false,
    });
  }
  return questions;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'math';

  try {
    const questions = generateDummyQuestions(category);
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 