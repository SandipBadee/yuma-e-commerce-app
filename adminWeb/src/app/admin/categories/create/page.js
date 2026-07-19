import Link from "next/link";
import { redirect } from "next/navigation";

import { createAdminCategoryAction } from "@/lib/actions";
import AdminCategoryForm from "@/components/admin/AdminCategoryForm";

export default async function CreateAdminCategoryPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const errorMessage = resolvedSearchParams?.error || "";

  async function createCategoryFormAction(formData) {
    "use server";

    const payload = {
      name: String(formData.get("name") || "").trim(),
      slug: String(formData.get("slug") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      image: String(formData.get("image") || "").trim(),
      status: String(formData.get("status") || "ACTIVE"),
      isFeatured: formData.get("isFeatured") === "on"
    };

    const result = await createAdminCategoryAction(payload);
    if (result.error) {
      redirect(`/admin/categories/create?error=${encodeURIComponent(result.error)}`);
    }

    redirect("/admin/categories");
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-title mt-2 text-3xl font-bold text-stone-900">Create Category</h2>
          <p className="mt-2 text-stone-600">Add a category with slug, image, and active status.</p>
        </div>
        <Link
          href="/admin/categories"
          className="rounded-lg border border-stone-300 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200"
        >
          Back to Categories
        </Link>
      </header>

      {errorMessage && (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 break-words">
          {errorMessage}
        </section>
      )}

      <AdminCategoryForm submitAction={createCategoryFormAction} submitLabel="Create Category" />
    </div>
  );
}
