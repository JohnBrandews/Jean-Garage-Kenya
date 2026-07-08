"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
};

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const endpoint = category ? `/api/categories/${category.id}` : "/api/categories";
  const method = category ? "PUT" : "POST";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      const payload = {
        name: String(formData.get("name") || "").trim(),
        imageUrl: String(formData.get("imageUrl") || "").trim() || null,
      };

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Unable to save category");
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 border border-border bg-white p-8">
      <Input label="Category Name" name="name" defaultValue={category?.name || ""} required />
      <Input label="Image URL" name="imageUrl" defaultValue={category?.imageUrl || ""} placeholder="Optional" />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" variant="primary" disabled={loading}>
        {loading ? "Saving..." : category ? "Update Category" : "Create Category"}
      </Button>
    </form>
  );
}
