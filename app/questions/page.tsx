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

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("math");
  const router = useRouter();

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/questions?category=${category}`);
      if (response.status === 401) {
        router.push("/");
        return;
      }
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
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

  useEffect(() => {
    fetchQuestions();
  }, [category]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="block w-full p-2 border rounded"
        >
          <option value="math">Mathematics</option>
          <option value="science">Science</option>
          <option value="history">History</option>
        </select>
        <button
          onClick={fetchQuestions}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Generate Questions
        </button>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="border p-4 rounded shadow">
            <h3 className="text-lg font-bold mb-2">
              Question {index + 1}: {question.question}
            </h3>
            <div className="space-y-2">
              {question.answers.map((answer, ansIndex) => (
                <div
                  key={ansIndex}
                  className={`p-2 rounded ${
                    ansIndex === question.correctAnswer
                      ? "bg-green-100 border-green-500"
                      : "bg-gray-100"
                  }`}
                >
                  {answer}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Score (1-5):
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={question.score || 1}
                  onChange={(e) =>
                    handleScoreChange(question.id, parseInt(e.target.value))
                  }
                  className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={question.isWrong}
                  onChange={(e) =>
                    handleWrongQuestion(question.id, e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Soru/Cevap Yanlış
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
