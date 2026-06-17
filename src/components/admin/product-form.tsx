"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseImages } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: string | number;
  compareAt: string | number | null;
  categoryId: string;
  images: string;
  featured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  sizes: Array<{ size: string; stock: number }>;
};

interface ProductFormProps {
  categories: Category[];
  product?: Product;
}

const defaultSizes = ["30", "32", "34", "36"];

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState("");
  const [imageUrls, setImageUrls] = useState(() => (product ? parseImages(product.images).join("\n") : ""));
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const sizes = product?.sizes?.length
    ? product.sizes
    : defaultSizes.map((size) => ({ size, stock: 0 }));

  const endpoint = product ? `/api/products/${product.id}` : "/api/products";
  const method = product ? "PUT" : "POST";

  const imagePreviewUrls = useMemo(
    () =>
      imageUrls
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    [imageUrls]
  );

  const uploadSelectedFiles = async () => {
    if (selectedFiles.length === 0) {
      return [];
    }

    setUploading(true);
    setUploadNotice("");

    try {
      const uploadedUrls: string[] = [];

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/uploads/cloudinary", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Upload failed");
        }

        uploadedUrls.push(result.secure_url);
      }

      setImageUrls((current) => {
        const existing = current
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
        const next = Array.from(new Set([...existing, ...uploadedUrls]));
        return next.join("\n");
      });
      setSelectedFiles([]);
      setUploadNotice(`Uploaded ${uploadedUrls.length} image${uploadedUrls.length > 1 ? "s" : ""} to Cloudinary.`);
      return uploadedUrls;
    } catch (err) {
      setUploadNotice(err instanceof Error ? err.message : "Upload failed");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      const sizeRows = Array.from({ length: 4 }, (_, i) => ({
        size: String(formData.get(`size-${i}`) || "").trim(),
        stock: Number(formData.get(`stock-${i}`) || 0),
      })).filter((row) => row.size.length > 0);

      const manualUrls = String(formData.get("images") || imageUrls)
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      const uploadedUrls = selectedFiles.length > 0 ? await uploadSelectedFiles() : [];
      const images = Array.from(new Set([...manualUrls, ...uploadedUrls]));

      if (images.length === 0) {
        throw new Error("Add at least one image URL or upload at least one file.");
      }

      const payload = {
        name: String(formData.get("name") || "").trim(),
        description: String(formData.get("description") || "").trim(),
        price: Number(formData.get("price") || 0),
        compareAt: String(formData.get("compareAt") || "").trim() ? Number(formData.get("compareAt")) : null,
        categoryId: String(formData.get("categoryId") || ""),
        images,
        featured: formData.get("featured") === "on",
        isNew: formData.get("isNew") === "on",
        isBestSeller: formData.get("isBestSeller") === "on",
        sizes: sizeRows,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Unable to save product");

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 border border-border bg-white p-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Input label="Product Name" name="name" defaultValue={product?.name || ""} required />
        <Input label="Price (KES)" name="price" type="number" step="0.01" defaultValue={product?.price || ""} required />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Input label="Compare At (KES)" name="compareAt" type="number" step="0.01" defaultValue={product?.compareAt || ""} />
        <div>
          <label className="mb-2 block text-sm font-semibold uppercase tracking-widest text-charcoal">
            Category
          </label>
          <select
            name="categoryId"
            defaultValue={product?.categoryId || categories[0]?.id}
            className="input-underline font-body text-base"
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold uppercase tracking-widest text-charcoal">
          Description
        </label>
        <textarea
          name="description"
          defaultValue={product?.description || ""}
          required
          rows={6}
          className="input-underline min-h-[10rem] w-full resize-y font-body text-base"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold uppercase tracking-widest text-charcoal">
          Image URLs
        </label>
        <textarea
          name="images"
          value={imageUrls}
          onChange={(e) => setImageUrls(e.target.value)}
          rows={5}
          placeholder="Paste one image URL per line"
          className="input-underline min-h-[8rem] w-full resize-y font-body text-base"
        />
      </div>

      <div className="space-y-3 border border-dashed border-black/10 bg-white/70 p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-charcoal">Upload from Device</p>
            <p className="text-xs text-charcoal/55">Files are uploaded to Cloudinary and their URLs are added above.</p>
          </div>
          <Button type="button" variant="secondary" onClick={() => void uploadSelectedFiles()} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload to Cloudinary"}
          </Button>
        </div>
        <Input
          label="Select Images"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setSelectedFiles(Array.from(e.currentTarget.files || []))}
        />
        {selectedFiles.length > 0 && (
          <p className="text-xs text-charcoal/55">
            {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected
          </p>
        )}
        {uploadNotice && <p className="text-sm text-gold">{uploadNotice}</p>}
        {imagePreviewUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {imagePreviewUrls.map((src) => (
              <div key={src} className="relative aspect-square overflow-hidden bg-light-gray">
                <Image src={src} alt="Product preview" fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-charcoal">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} />
          Featured
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-charcoal">
          <input type="checkbox" name="isNew" defaultChecked={product?.isNew ?? false} />
          New Arrival
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-charcoal">
          <input type="checkbox" name="isBestSeller" defaultChecked={product?.isBestSeller ?? false} />
          Best Seller
        </label>
      </div>

      <div>
        <div className="mb-3 flex items-end justify-between">
          <label className="block text-sm font-semibold uppercase tracking-widest text-charcoal">
            Sizes and Stock
          </label>
          <p className="text-xs uppercase tracking-[0.2em] text-charcoal/45">Add the sizes you want to stock</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {sizes.map((size, index) => (
            <div key={`${size.size}-${index}`} className="grid grid-cols-[1fr_120px] gap-3">
              <Input label={`Size ${index + 1}`} name={`size-${index}`} defaultValue={size.size} />
              <Input label="Stock" name={`stock-${index}`} type="number" defaultValue={size.stock} />
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" variant="primary" disabled={loading}>
        {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
      </Button>
    </form>
  );
}
