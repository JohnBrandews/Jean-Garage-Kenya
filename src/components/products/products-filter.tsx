"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductsFilterProps {
  categories: Category[];
  currentParams: Record<string, string | undefined>;
}

const sizes = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36"];

export function ProductsFilter({ categories, currentParams }: ProductsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <aside className="w-full shrink-0 lg:w-[18rem]">
      <div className="sticky top-28 space-y-8">
        <div>
          <p className="section-label mb-3">Categories</p>
          <div className="space-y-3">
            <button
              onClick={() => updateFilter("category", "")}
              className={`flex items-center gap-3 text-sm transition-colors ${
                !currentParams.category ? "font-semibold text-gold" : "text-charcoal/70 hover:text-charcoal"
              }`}
            >
              <span className={`h-3.5 w-3.5 border ${!currentParams.category ? "border-gold bg-gold" : "border-charcoal/25"}`} />
              All Collections
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateFilter("category", cat.slug)}
                className={`flex items-center gap-3 text-sm transition-colors ${
                  currentParams.category === cat.slug ? "font-semibold text-gold" : "text-charcoal/70 hover:text-charcoal"
                }`}
              >
                <span
                  className={`h-3.5 w-3.5 border ${
                    currentParams.category === cat.slug ? "border-gold bg-gold" : "border-charcoal/25"
                  }`}
                />
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="section-label mb-3">Size</p>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => updateFilter("size", currentParams.size === size ? "" : size)}
                className={`border px-3 py-2 text-xs font-semibold tracking-[0.2em] transition-colors ${
                  currentParams.size === size
                    ? "border-gold bg-gold text-white"
                    : "border-border bg-transparent text-charcoal hover:border-gold"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="section-label mb-3">Sort By</p>
          <div className="editorial-panel px-4 py-3">
            <select
              value={currentParams.sort || "newest"}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        <div>
          <p className="section-label mb-3">Search</p>
          <input
            type="text"
            defaultValue={currentParams.search || ""}
            placeholder="Search the archive..."
            className="input-underline text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateFilter("search", (e.target as HTMLInputElement).value);
              }
            }}
          />
        </div>
      </div>
    </aside>
  );
}
