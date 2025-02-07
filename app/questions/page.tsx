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

  const handleWrongQuestion = async (questionId: string, isWrong: boolean) => {
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
      console.error("Error updating question status:", error);
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

  useEffect(() => {
    fetchQuestions();
  }, []); // Only fetch on mount

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-800">
              Soru Üretici
            </h1>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Çıkış Yap
            </button>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-4">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="flex-1 p-2 border border-gray-200 rounded-md text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {HISTORY_TOPICS.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
              <button
                onClick={fetchQuestions}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                Yeni Sorular Üret
              </button>
            </div>
            {lastGenerated && (
              <p className="text-sm text-gray-500">
                Son üretilen: {lastGenerated}
              </p>
            )}
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="border border-gray-100 rounded-lg p-6 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-800">
                    Soru {index + 1}
                  </h3>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={question.score || 1}
                      onChange={(e) =>
                        handleScoreChange(question.id, parseInt(e.target.value))
                      }
                      className="w-16 p-1 border border-gray-200 rounded text-center"
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={question.isWrong}
                        onChange={(e) =>
                          handleWrongQuestion(question.id, e.target.checked)
                        }
                        className="rounded text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Hatalı</span>
                    </label>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{question.question}</p>
                <div className="space-y-2">
                  {question.answers.map((answer, ansIndex) => (
                    <div
                      key={ansIndex}
                      className={`p-3 rounded-md ${
                        ansIndex === question.correctAnswer
                          ? "bg-green-50 border border-green-100 text-green-700"
                          : "bg-gray-50 border border-gray-100 text-gray-600"
                      }`}
                    >
                      {answer}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
