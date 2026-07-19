import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getAdminCategoryByIdAction,
  updateAdminCategoryAction
} from "@/lib/actions";
import AdminCategoryForm from "@/components/admin/AdminCategoryForm";

export default async function EditAdminCategoryPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const categoryId = resolvedParams?.id;
  const errorMessage = resolvedSearchParams?.error || "";

  if (!categoryId) {
    return (
      <div className="space-y-4">
        <h2 className="font-title text-3xl font-bold text-stone-900">Edit Category</h2>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Invalid category id provided.
        </p>
      </div>
    );
  }

  const categoryResult = await getAdminCategoryByIdAction(categoryId);

  if (categoryResult.error) {
    return (
      <div className="space-y-4">
        <h2 className="font-title text-3xl font-bold text-stone-900">Edit Category</h2>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {categoryResult.error}
        </p>
      </div>
    );
  }

  const category = categoryResult.data;

  async function updateCategoryFormAction(formData) {
    "use server";

    const payload = {
      name: String(formData.get("name") || "").trim(),
      slug: String(formData.get("slug") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      image: String(formData.get("image") || "").trim(),
      status: String(formData.get("status") || "ACTIVE"),
      isFeatured: formData.get("isFeatured") === "on"
    };

    const result = await updateAdminCategoryAction(categoryId, payload);
    if (result.error) {
      redirect(`/admin/categories/${categoryId}/edit?error=${encodeURIComponent(result.error)}`);
    }

    redirect(`/admin/categories/${categoryId}`);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-title mt-2 text-3xl font-bold text-stone-900">Edit Category</h2>
          <p className="mt-2 text-stone-600">Update category content and active status.</p>
        </div>
        <Link
          href={`/admin/categories/${categoryId}`}
          className="rounded-lg border border-stone-300 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200"
        >
          Back to Details
        </Link>
      </header>

      {errorMessage && (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 break-words">
          {errorMessage}
        </section>
      )}

      <AdminCategoryForm
        submitAction={updateCategoryFormAction}
        submitLabel="Save Changes"
        initialValues={{
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          status: category.isActive ? "ACTIVE" : "INACTIVE",
          isFeatured: Boolean(category.isFeatured)
        }}
      />
    </div>
  );
}
