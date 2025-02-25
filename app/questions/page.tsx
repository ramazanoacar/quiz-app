"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HISTORY_TOPICS } from "@/lib/topics";

interface Question {
  id: string;
  question: string;
  answers: string[];
  correctAnswer: number;
  score: number;
  isWrong: boolean;
  hasInfoError: boolean;
  category: string;
  addedAt: string;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    HISTORY_TOPICS.map((topic) => topic.id)
  );
  const router = useRouter();

  const fetchQuestions = async () => {
    if (loading) setLoading(true);
    try {
      const responses = await Promise.all(
        selectedTopics.map((topic) =>
          fetch(`/api/questions?category=${topic}`).then((res) => res.json())
        )
      );
      const allQuestions = responses
        .flat()
        .sort(
          (a, b) =>
            new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );
      setQuestions(allQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      router.push("/");
    }
    setLoading(false);
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

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topicId)) {
        // Don't allow deselecting if it's the last selected topic
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== topicId);
      }
      return [...prev, topicId];
    });
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopics]);

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
              onClick={() => router.push("/informations")}
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
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Bağlam Ekle
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

        <div className="flex flex-wrap gap-3 mb-8 bg-white/5 p-6 rounded-lg shadow-md">
          {HISTORY_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => handleTopicToggle(topic.id)}
              className={`px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2 ${
                selectedTopics.includes(topic.id)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <span className="w-4 h-4 border-2 rounded flex items-center justify-center">
                {selectedTopics.includes(topic.id) && (
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </span>
              {topic.name}
            </button>
          ))}
        </div>

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
                  <span className="px-8 py-3 bg-gray-700/50 text-gray-200 rounded-lg text-base font-medium border border-gray-600">
                    {HISTORY_TOPICS.find((t) => t.id === question.category)
                      ?.name || question.category}
                  </span>
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
