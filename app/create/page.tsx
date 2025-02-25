"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Information } from "@prisma/client";
import { HISTORY_TOPICS } from "@/lib/topics";

export default function CreateQuestionsPage() {
  const [selectedTopic, setSelectedTopic] = useState(HISTORY_TOPICS[0].id);
  const [selectedContexts, setSelectedContexts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [availableContexts, setAvailableContexts] = useState<Information[]>([]);

  useEffect(() => {
    fetchContexts();
  }, [selectedTopic]);

  const fetchContexts = async () => {
    try {
      const response = await fetch(
        `/api/informations?category=${selectedTopic}`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableContexts(data);
      }
    } catch (error) {
      console.error("Error fetching contexts:", error);
    }
  };

  const handleContextToggle = (context: string) => {
    setSelectedContexts((prev) => {
      if (prev.includes(context)) {
        return prev.filter((c) => c !== context);
      } else if (prev.length < 5) {
        return [...prev, context];
      }
      alert("En fazla 5 bağlam seçebilirsiniz");
      return prev;
    });
  };

  const handleCreateQuestions = async () => {
    if (selectedContexts.length === 0) {
      alert("Lütfen en az bir bağlam seçin");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/questions?category=${selectedTopic}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contexts: selectedContexts,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create questions");
      }

      router.push("/questions");
    } catch (error) {
      console.error("Error creating questions:", error);
      alert("Soru oluşturma sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8 bg-white/5 rounded-lg p-6 shadow-md">
          <div>
            <h1 className="text-3xl font-bold text-white">
              <span className="text-blue-400">Soru Oluştur</span>
            </h1>
            <p className="text-gray-400 mt-2">
              Seçilen bağlama göre yeni sorular oluşturun
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/questions")}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200"
            >
              Sorular
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200"
            >
              Çıkış
            </button>
          </div>
        </header>

        <div className="bg-white/5 rounded-lg p-6 shadow-md space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Konu Seçin
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                setSelectedContexts([]);
              }}
              className="w-full px-4 py-3 bg-gray-800 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {HISTORY_TOPICS.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-300">
                Bağlam Seçin (En fazla 5)
              </label>
              <span className="text-sm text-gray-400">
                {selectedContexts.length}/5 seçildi
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableContexts.map((context) => (
                <button
                  key={context.id}
                  onClick={() => handleContextToggle(context.text)}
                  className={`p-4 rounded-lg text-left transition-colors duration-200 relative ${
                    selectedContexts.includes(context.text)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                  }`}
                >
                  {context.text}
                  {selectedContexts.includes(context.text) && (
                    <span className="absolute top-2 right-2 bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {selectedContexts.indexOf(context.text) + 1}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-300 mb-2">
                Seçilen Bağlamlar:
              </h3>
              <div className="space-y-2">
                {selectedContexts.map((context, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-700/50 p-2 rounded-md"
                  >
                    <span className="text-sm">
                      {index + 1}. {context}
                    </span>
                    <button
                      onClick={() => handleContextToggle(context)}
                      className="text-red-400 hover:text-red-300"
                    >
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleCreateQuestions}
            disabled={loading || selectedContexts.length === 0}
            className={`w-full py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${
              loading || selectedContexts.length === 0
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
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
                Sorular Oluştur
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
