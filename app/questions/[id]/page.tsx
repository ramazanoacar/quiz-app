"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  context: string;
  information: string;
  question: string;
  answers: string[];
  correctAnswer: number;
  preferredQuestion: string;
  preferredAnswers: string[];
  preferredCorrectAnswer: number;
  score: number;
  isWrong: boolean;
  category: string;
}

export default function QuestionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferredQuestion, setPreferredQuestion] = useState("");
  const [preferredAnswers, setPreferredAnswers] = useState<string[]>([]);
  const [preferredCorrectAnswer, setPreferredCorrectAnswer] = useState(-1);
  const router = useRouter();

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(`/api/questions/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch question");
        }
        const data = await response.json();
        setQuestion(data);
        // Initialize preferred values with actual values if they're empty
        setPreferredQuestion(data.preferredQuestion || data.question);
        setPreferredAnswers(
          data.preferredAnswers.length > 0
            ? data.preferredAnswers
            : data.answers
        );
        setPreferredCorrectAnswer(
          data.preferredCorrectAnswer === -1
            ? data.correctAnswer
            : data.preferredCorrectAnswer
        );
      } catch (error) {
        console.error("Error fetching question:", error);
        router.push("/questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [params.id, router]);

  const handleMarkAsChecked = async () => {
    try {
      await fetch(`/api/questions/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checked: true,
          preferredQuestion,
          preferredAnswers,
          preferredCorrectAnswer,
        }),
      });
      router.push("/questions");
    } catch (error) {
      console.error("Error marking question as checked:", error);
    }
  };

  const handlePreferredAnswerChange = (index: number, value: string) => {
    const newAnswers = [...preferredAnswers];
    newAnswers[index] = value;
    setPreferredAnswers(newAnswers);
  };

  if (loading || !question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800/50 rounded-lg p-8 shadow-lg">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-6">Soru Detayları</h1>
            <button
              onClick={() => router.push("/questions")}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Geri Dön
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Genel Bilgi</h2>
              <p className="text-gray-300">{question.context}</p>
            </div>

            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Özel Bilgi</h2>
              <p className="text-gray-300">{question.information}</p>
            </div>

            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Soru</h2>
              <p className="text-gray-300 mb-4">{question.question}</p>

              <h3 className="text-md font-medium mb-2 text-blue-400">
                Düzenlenmiş Soru
              </h3>
              <textarea
                value={preferredQuestion}
                onChange={(e) => setPreferredQuestion(e.target.value)}
                className="w-full bg-gray-800 text-gray-200 p-3 rounded-md border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Cevaplar</h2>
              <div className="space-y-6">
                <div className="space-y-3">
                  {question.answers.map((answer, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-md ${
                        index === question.correctAnswer
                          ? "bg-green-700/20 border border-green-600"
                          : "bg-gray-600/50"
                      }`}
                    >
                      <span className="font-bold mr-2">
                        {String.fromCharCode(65 + index)}:
                      </span>
                      {answer}
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-gray-600">
                  <h3 className="text-md font-medium mb-4 text-blue-400">
                    Düzenlenmiş Cevaplar
                  </h3>
                  <div className="space-y-3">
                    {preferredAnswers.map((answer, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className="font-bold min-w-[2rem]">
                          {String.fromCharCode(65 + index)}:
                        </span>
                        <input
                          type="text"
                          value={answer}
                          onChange={(e) =>
                            handlePreferredAnswerChange(index, e.target.value)
                          }
                          className="flex-1 bg-gray-800 text-gray-200 p-2 rounded-md border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                          type="radio"
                          name="preferredCorrect"
                          checked={index === preferredCorrectAnswer}
                          onChange={() => setPreferredCorrectAnswer(index)}
                          className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-gray-400">
                    Düzenlenmiş sorunun cevabı:{" "}
                    <span className="font-medium text-green-400">
                      {preferredCorrectAnswer !== -1
                        ? String.fromCharCode(65 + preferredCorrectAnswer)
                        : "Seçilmemiş"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleMarkAsChecked}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Kontrol Edildi Olarak İşaretle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
