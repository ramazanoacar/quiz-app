"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  question: string;
  answers: string[];
  correctAnswer: number;
  score: number;
  isWrong: boolean;
  hasInfoError: boolean;
}

const HISTORY_TOPICS = [
  {
    id: "anadolu_selcuklu",
    name: "Anadolu Selçuklu Devleti ve Türkiye Tarihi",
  },
  {
    id: "beylikten_devlete",
    name: "Beylikten Devlete Osmanlı",
  },
  {
    id: "degisen_dunya",
    name: "Değişen Dünya Dengeleri Karşısında Osmanlı Siyaseti",
  },
  {
    id: "degisim_cagi",
    name: "Değişim Çağında Osmanlı Devleti",
  },
  {
    id: "deka_dunya",
    name: "Deka Dünya Gücü Osmanlı",
  },
  {
    id: "ilk_cag",
    name: "İlk Çağ Uygarlıkları",
  },
  {
    id: "turk_dunyasi",
    name: "İlk ve Orta Çağlarda Türk Dünyası",
  },
  {
    id: "islam_medeniyeti",
    name: "İslam Medeniyetinin Doğuşu",
  },
  {
    id: "turk_islam",
    name: "Türk İslam Tarihi",
  },
];

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(HISTORY_TOPICS[0].id);
  const [lastGenerated, setLastGenerated] = useState("");
  const router = useRouter();

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/questions?category=${selectedTopic}`);
      if (response.status === 401) {
        router.push("/");
        return;
      }
      const data = await response.json();
      setQuestions(data);
      setLastGenerated(
        HISTORY_TOPICS.find((t) => t.id === selectedTopic)?.name || ""
      );
    } catch (error) {
      console.error("Error fetching questions:", error);
      router.push("/");
    }
    setLoading(false);
  };

  const generateNewQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/questions?category=${selectedTopic}`, {
        method: "POST",
      });

      if (response.status === 401) {
        router.push("/");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      // Fetch the newly generated questions
      await fetchQuestions();
    } catch (error) {
      console.error("Error generating questions:", error);
    }
    setLoading(false);
  };

  const handleScoreChange = async (questionId: string, score: number) => {
    try {
      await fetch(`/api/questions/${questionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ score }),
      });

      setQuestions(
        questions.map((q) => (q.id === questionId ? { ...q, score } : q))
      );
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  const handleAnswerError = async (questionId: string, isWrong: boolean) => {
    try {
      await fetch(`/api/questions/${questionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isWrong }),
      });

      setQuestions(
        questions.map((q) => (q.id === questionId ? { ...q, isWrong } : q))
      );
    } catch (error) {
      console.error("Error updating answer error status:", error);
    }
  };

  const handleInfoError = async (questionId: string, hasInfoError: boolean) => {
    try {
      await fetch(`/api/questions/${questionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hasInfoError }),
      });

      setQuestions(
        questions.map((q) => (q.id === questionId ? { ...q, hasInfoError } : q))
      );
    } catch (error) {
      console.error("Error updating info error status:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleCheckQuestion = (questionId: string) => {
    router.push(`/questions/${questionId}`);
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
        <svg
          className="animate-spin h-12 w-12 text-white"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Updated Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white/5 rounded-lg p-6 shadow-md">
          <div>
            <h1 className="text-3xl font-bold text-white">
              <span className="text-blue-400">Soru Üretici</span> Sistemi
            </h1>
            <p className="text-gray-400 mt-2">
              Tarih dersi için örnek soru üretme arayüzü
            </p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <button
              onClick={() => router.push("/create")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 flex items-center gap-2"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Yeni Oluştur
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Çıkış
            </button>
          </div>
        </header>

        {/* Remove the "Yeni Sorular Üret" button from Controls Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 bg-white/5 p-6 rounded-lg shadow-md">
          <div className="relative flex-1 w-full">
            <label htmlFor="topic-select" className="sr-only">
              Seçili Konu
            </label>
            <select
              id="topic-select"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full min-w-[300px] sm:min-w-[400px] lg:min-w-[500px] px-4 py-3 bg-gray-800 rounded-md text-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
            >
              {HISTORY_TOPICS.map((topic) => (
                <option key={topic.id} value={topic.id} className="py-2">
                  {topic.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="bg-gray-800/50 hover:bg-gray-800 transition-colors duration-200 rounded-lg p-6 shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4 sm:mb-0">
                  <span className="inline-block px-2 py-1 bg-blue-600 text-white rounded-md">
                    #{index + 1}
                  </span>
                  {question.question}
                </h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleCheckQuestion(question.id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200 flex items-center gap-2"
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
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Kontrol Et
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {question.answers.map((answer, ansIndex) => {
                  const isCorrect = ansIndex === question.correctAnswer;
                  return (
                    <div
                      key={ansIndex}
                      className={`flex items-center gap-3 px-4 py-3 rounded-md text-gray-300 transition-colors ${
                        isCorrect
                          ? "bg-green-700/20 border border-green-600 text-green-300"
                          : "bg-gray-700/50 hover:bg-gray-700"
                      }`}
                    >
                      <span className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-md text-sm font-bold">
                        {String.fromCharCode(65 + ansIndex)}
                      </span>
                      <span>{answer}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
