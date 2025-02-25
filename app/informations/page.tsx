"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HISTORY_TOPICS } from "@/lib/topics";

interface Information {
  id: string;
  text: string;
  category: string;
}

export default function InformationsPage() {
  const [informations, setInformations] = useState<Information[]>([]);
  const [newText, setNewText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    HISTORY_TOPICS[0].id
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchInformations();
  }, [selectedCategory]);

  const fetchInformations = async () => {
    try {
      const response = await fetch(
        `/api/informations?category=${selectedCategory}`
      );
      if (response.ok) {
        const data = await response.json();
        setInformations(data);
      }
    } catch (error) {
      console.error("Error fetching informations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    try {
      const response = await fetch("/api/informations", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          text: newText,
          category: selectedCategory,
        }),
      });

      if (response.ok) {
        setNewText("");
        setEditingId(null);
        fetchInformations();
      }
    } catch (error) {
      console.error("Error saving information:", error);
    }
  };

  const handleEdit = (info: Information) => {
    setNewText(info.text);
    setEditingId(info.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu bilgiyi silmek istediğinizden emin misiniz?")) return;

    try {
      const response = await fetch(`/api/informations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchInformations();
      }
    } catch (error) {
      console.error("Error deleting information:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Bağlam Yönetimi</h1>
          <button
            onClick={() => router.push("/questions")}
            className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Sorulara Dön
          </button>
        </header>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Kategori</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-700 rounded-md p-2"
              >
                {HISTORY_TOPICS.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Bağlam Metni
              </label>
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full bg-gray-700 rounded-md p-2 min-h-[100px]"
                placeholder="Bağlam metnini girin..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 py-2 rounded-md hover:bg-blue-700"
            >
              {editingId ? "Güncelle" : "Ekle"}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {informations.map((info) => (
            <div
              key={info.id}
              className="bg-gray-800 rounded-lg p-4 flex justify-between items-start"
            >
              <p className="text-gray-300">{info.text}</p>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(info)}
                  className="p-2 bg-yellow-600 rounded-md hover:bg-yellow-700"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(info.id)}
                  className="p-2 bg-red-600 rounded-md hover:bg-red-700"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
