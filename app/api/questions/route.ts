import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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
    turk_islam: "Türk İslam"
  };

  const topicName = topics[category as keyof typeof topics] || category;

  for (let i = 0; i < 10; i++) {
    questions.push({
      id: `q${i}`,
      question: `${topicName} konusu ile ilgili örnek soru ${i + 1}?`,
      answers: [
        `${topicName} - Cevap A örneği ${i + 1}`,
        `${topicName} - Cevap B örneği ${i + 1}`,
        `${topicName} - Cevap C örneği ${i + 1}`,
        `${topicName} - Cevap D örneği ${i + 1}`,
        `${topicName} - Cevap E örneği ${i + 1}`,
      ],
      correctAnswer: Math.floor(Math.random() * 5),
      score: 1,
      isWrong: false,
    });
  }
  return questions;
}

export async function GET(request: Request) {
  // Check authentication
  const cookieStore = cookies();
  const authCookie = cookieStore.get('auth');

  if (!authCookie || authCookie.value !== 'true') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'math';

  try {
    const questions = generateDummyQuestions(category);
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 