import { CategoryForm } from "@/components/admin/category-form";

export const metadata = { title: "Add Category" };

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-charcoal">Add Category</h1>
      <p className="mt-1 text-gray-500">Create a new product category for the catalog.</p>

      <div className="mt-8 max-w-2xl">
        <CategoryForm />
      </div>
    </div>
  );
}
