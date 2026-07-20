"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  brand: string | null;
  color: string | null;
  wholesalePrice: string | number | null;
  wholesaleMinQty: number | null;
  featured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  sizes: Array<{ size: string; stock: number }>;
};

interface ProductFormProps {
  categories: Category[];
  product?: Product;
  initialCategoryId?: string;
}

const ALPHA_PRESETS = ["S", "M", "L", "XL", "2XL", "3XL"];
const NUMERIC_PRESETS = ["28", "30", "32", "34", "36", "38", "40", "42"];

function isAlphaSize(size: string) {
  return ALPHA_PRESETS.includes(size.trim().toUpperCase());
}

function isNumericSize(size: string) {
  return NUMERIC_PRESETS.includes(size.trim());
}

function inferEnabledSystems(sizes: Array<{ size: string; stock: number }> = []) {
  const normalizedSizes = sizes.map((entry) => normalizePresetSize(entry.size));

  return {
    alpha: normalizedSizes.some((size) => isAlphaSize(size)),
    numeric: normalizedSizes.some((size) => isNumericSize(size)),
  };
}

function normalizePresetSize(size: string) {
  return size.trim().toUpperCase();
}

export function ProductForm({ categories, product, initialCategoryId }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState("");
  const [imageUrls, setImageUrls] = useState(() => (product ? parseImages(product.images).join("\n") : ""));
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [enabledSystems, setEnabledSystems] = useState(() => inferEnabledSystems(product?.sizes));
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    () => product?.sizes?.map((entry) => normalizePresetSize(entry.size)) ?? []
  );
  const [variantStock, setVariantStock] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      product?.sizes?.map((entry) => [normalizePresetSize(entry.size), entry.stock]) ?? []
    )
  );
  const [hasBrand, setHasBrand] = useState(Boolean(product?.brand?.trim()));
  const [brandValue, setBrandValue] = useState(product?.brand ?? "");
  const [hasColor, setHasColor] = useState(Boolean(product?.color?.trim()));
  const [colorValue, setColorValue] = useState(product?.color ?? "");
  const [wholesalePrice, setWholesalePrice] = useState(product?.wholesalePrice ? String(product.wholesalePrice) : "");
  const [wholesaleMinQty, setWholesaleMinQty] = useState(String(product?.wholesaleMinQty ?? 10));

  const presetOrder = useMemo(
    () =>
      new Map(
        [...ALPHA_PRESETS, ...NUMERIC_PRESETS].map((size, index) => [size, index])
      ),
    []
  );

  const imagePreviewUrls = useMemo(
    () =>
      imageUrls
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    [imageUrls]
  );

  const activeVariants = useMemo(
    () =>
      [...selectedSizes]
        .sort((left, right) => (presetOrder.get(left) ?? 999) - (presetOrder.get(right) ?? 999))
        .map((size) => ({ size, stock: Number(variantStock[size] ?? 0) })),
    [presetOrder, selectedSizes, variantStock]
  );

  const endpoint = product ? `/api/products/${product.id}` : "/api/products";
  const method = product ? "PUT" : "POST";

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

  const toggleSizeSystem = (system: "alpha" | "numeric", enabled: boolean) => {
    setEnabledSystems((current) => ({ ...current, [system]: enabled }));

    if (!enabled) {
      const shouldKeep = system === "alpha" ? isNumericSize : isAlphaSize;
      setSelectedSizes((current) => current.filter((size) => shouldKeep(size)));
      setVariantStock((current) =>
        Object.fromEntries(
          Object.entries(current).filter(([size]) => shouldKeep(size))
        )
      );
    }
  };

  const toggleSize = (size: string) => {
    const normalized = normalizePresetSize(size);

    setSelectedSizes((current) =>
      current.includes(normalized) ? current.filter((entry) => entry !== normalized) : [...current, normalized]
    );

    setVariantStock((current) =>
      Object.prototype.hasOwnProperty.call(current, normalized) ? current : { ...current, [normalized]: 0 }
    );
  };

  const updateStock = (size: string, stock: string) => {
    const parsed = Number(stock);
    setVariantStock((current) => ({
      ...current,
      [size]: Number.isFinite(parsed) ? parsed : 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      const manualUrls = String(formData.get("images") || imageUrls)
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      const uploadedUrls = selectedFiles.length > 0 ? await uploadSelectedFiles() : [];
      const images = Array.from(new Set([...manualUrls, ...uploadedUrls]));

      if (images.length === 0) {
        throw new Error("Add at least one image URL or upload at least one file.");
      }

      if (activeVariants.length === 0) {
        throw new Error("Select at least one size before saving the product.");
      }

      const payload = {
        name: String(formData.get("name") || "").trim(),
        description: String(formData.get("description") || "").trim(),
        brand: hasBrand && brandValue.trim() ? brandValue.trim() : null,
        color: hasColor && colorValue.trim() ? colorValue.trim() : null,
        wholesalePrice: wholesalePrice.trim() ? Number(wholesalePrice) : null,
        wholesaleMinQty: Number(wholesaleMinQty || 10),
        price: Number(formData.get("price") || 0),
        compareAt: String(formData.get("compareAt") || "").trim() ? Number(formData.get("compareAt")) : null,
        categoryId: String(formData.get("categoryId") || ""),
        images,
        featured: formData.get("featured") === "on",
        isNew: formData.get("isNew") === "on",
        isBestSeller: formData.get("isBestSeller") === "on",
        sizes: activeVariants,
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

  const activeSystemsLabel = [
    enabledSystems.alpha ? "Alpha sizing" : null,
    enabledSystems.numeric ? "Numeric sizing" : null,
  ]
    .filter(Boolean)
    .join(" + ");

  return (
    <form onSubmit={handleSubmit} className="space-y-6 border border-border bg-white p-6 md:p-8">
      <div className="flex flex-col gap-2 border-b border-border pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Product Builder</p>
        <h2 className="font-display text-2xl font-bold text-charcoal">Bundle / co-ord variant matrix</h2>
        <p className="max-w-2xl text-sm leading-6 text-charcoal/60">
          Use one or both sizing systems for matching products, reveal brand or color only when needed, and tick
          sizes to generate stock inputs instantly.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Input label="Product Name" name="name" defaultValue={product?.name || ""} required />
        <Input label="Price (KES)" name="price" type="number" step="0.01" defaultValue={product?.price || ""} required />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Input
          label="Compare At (KES)"
          name="compareAt"
          type="number"
          step="0.01"
          defaultValue={product?.compareAt || ""}
        />
        <div>
          <label className="mb-2 block text-sm font-semibold uppercase tracking-widest text-charcoal">Category</label>
          <select
            name="categoryId"
            defaultValue={product?.categoryId || initialCategoryId || categories[0]?.id}
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
        <label className="mb-2 block text-sm font-semibold uppercase tracking-widest text-charcoal">Description</label>
        <textarea
          name="description"
          defaultValue={product?.description || ""}
          required
          rows={6}
          className="input-underline min-h-[10rem] w-full resize-y font-body text-base"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 border border-border bg-light-gray/40 p-4">
          <label className="flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-charcoal">
            <input
              type="checkbox"
              checked={hasBrand}
              onChange={(event) => {
                setHasBrand(event.target.checked);
                if (!event.target.checked) {
                  setBrandValue("");
                }
              }}
            />
            Optional Brand
          </label>
          {hasBrand && (
            <Input
              label="Brand"
              value={brandValue}
              onChange={(event) => setBrandValue(event.target.value)}
              placeholder="e.g. Levi's, Zara, Nike"
            />
          )}
        </div>

        <div className="space-y-3 border border-border bg-light-gray/40 p-4">
          <label className="flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-charcoal">
            <input
              type="checkbox"
              checked={hasColor}
              onChange={(event) => {
                setHasColor(event.target.checked);
                if (!event.target.checked) {
                  setColorValue("");
                }
              }}
            />
            Optional Color
          </label>
          {hasColor && (
            <Input
              label="Color"
              value={colorValue}
              onChange={(event) => setColorValue(event.target.value)}
              placeholder="e.g. Indigo, Stone Black"
            />
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Wholesale Price"
          type="number"
          step="0.01"
          min="0"
          value={wholesalePrice}
          onChange={(event) => setWholesalePrice(event.target.value)}
          placeholder="Optional"
        />
        <Input
          label="Wholesale Minimum Qty"
          type="number"
          min="1"
          value={wholesaleMinQty}
          onChange={(event) => setWholesaleMinQty(event.target.value)}
        />
      </div>

      <div className="space-y-4 border border-border bg-light-gray/30 p-4 md:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-charcoal">Bundle / co-ord mode</p>
            <p className="text-xs text-charcoal/55">
              Enable alpha, numeric, or both when the product includes matching pieces.
            </p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
            {activeSystemsLabel || "No sizing system selected"}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label
            className={`flex cursor-pointer items-start gap-3 border p-4 text-sm transition-colors ${
              enabledSystems.alpha ? "border-gold bg-white" : "border-black/10 bg-white/70"
            }`}
          >
            <input
              type="checkbox"
              checked={enabledSystems.alpha}
              onChange={(event) => toggleSizeSystem("alpha", event.target.checked)}
              className="mt-1"
            />
            <span>
              <span className="block font-semibold uppercase tracking-[0.22em] text-charcoal">Alpha sizing</span>
              <span className="mt-1 block text-xs text-charcoal/55">S, M, L, XL, 2XL, 3XL for tops and outerwear.</span>
            </span>
          </label>

          <label
            className={`flex cursor-pointer items-start gap-3 border p-4 text-sm transition-colors ${
              enabledSystems.numeric ? "border-gold bg-white" : "border-black/10 bg-white/70"
            }`}
          >
            <input
              type="checkbox"
              checked={enabledSystems.numeric}
              onChange={(event) => toggleSizeSystem("numeric", event.target.checked)}
              className="mt-1"
            />
            <span>
              <span className="block font-semibold uppercase tracking-[0.22em] text-charcoal">Numeric sizing</span>
              <span className="mt-1 block text-xs text-charcoal/55">
                28, 30, 32, 34, 36, 38, 40, 42 for jeans and pants.
              </span>
            </span>
          </label>
        </div>

        <div>
          <div className="space-y-5">
            {enabledSystems.alpha && (
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-sm font-semibold uppercase tracking-widest text-charcoal">
                    Alpha sizes
                  </label>
                  <p className="text-xs uppercase tracking-[0.2em] text-charcoal/45">S, M, L, XL, 2XL, 3XL</p>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                  {ALPHA_PRESETS.map((size) => {
                    const active = selectedSizes.includes(size);

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`flex min-h-12 items-center justify-center border px-3 py-3 text-sm font-semibold transition-colors ${
                          active
                            ? "border-gold bg-gold text-white"
                            : "border-black/10 bg-white text-charcoal hover:border-gold"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {enabledSystems.numeric && (
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-sm font-semibold uppercase tracking-widest text-charcoal">
                    Numeric sizes
                  </label>
                  <p className="text-xs uppercase tracking-[0.2em] text-charcoal/45">28, 30, 32, 34, 36, 38, 40, 42</p>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                  {NUMERIC_PRESETS.map((size) => {
                    const active = selectedSizes.includes(size);

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`flex min-h-12 items-center justify-center border px-3 py-3 text-sm font-semibold transition-colors ${
                          active
                            ? "border-gold bg-gold text-white"
                            : "border-black/10 bg-white text-charcoal hover:border-gold"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-end justify-between gap-3">
            <label className="block text-sm font-semibold uppercase tracking-widest text-charcoal">
              Stock inputs
            </label>
            <p className="text-xs text-charcoal/45">Fields appear as sizes are selected.</p>
          </div>

          {selectedSizes.length === 0 ? (
            <div className="border border-dashed border-border bg-white px-4 py-8 text-center text-sm text-charcoal/55">
              Select one or more sizes to reveal the stock matrix.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeVariants.map((variant) => (
                <div key={variant.size} className="border border-border bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-charcoal">{variant.size}</p>
                    <button
                      type="button"
                      onClick={() => toggleSize(variant.size)}
                      className="text-xs font-semibold uppercase tracking-[0.18em] text-gold hover:text-gold-dark"
                    >
                      Remove
                    </button>
                  </div>
                  <Input
                    label="Stock"
                    type="number"
                    min="0"
                    value={variantStock[variant.size] ?? 0}
                    onChange={(event) => updateStock(variant.size, event.target.value)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold uppercase tracking-widest text-charcoal">Image URLs</label>
        <textarea
          name="images"
          value={imageUrls}
          onChange={(event) => setImageUrls(event.target.value)}
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
          onChange={(event) => setSelectedFiles(Array.from(event.currentTarget.files || []))}
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
                <Image
                  src={src}
                  alt="Product preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
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

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" variant="primary" disabled={loading}>
        {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
      </Button>
    </form>
  );
}
