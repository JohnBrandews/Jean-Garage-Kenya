"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type DeleteProductButtonProps = {
  productId: string;
  productName: string;
  redirectTo?: string;
};

export function DeleteProductButton({
  productId,
  productName,
  redirectTo = "/admin/products",
}: DeleteProductButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${productName}"? This will remove the product from the database.`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete product");
      }

      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      className="border-red-300 text-red-700 hover:border-red-500 hover:text-red-800"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {loading ? "Deleting..." : "Delete"}
    </Button>
  );
}
