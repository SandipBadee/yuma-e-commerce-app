import Link from "next/link";
import { redirect } from "next/navigation";
/* eslint-disable @next/next/no-img-element */

import {
  getAdminCategoryByIdAction,
  updateAdminCategoryStatusAction
} from "@/lib/actions";

export default async function AdminCategoryDetailsPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const categoryId = resolvedParams?.id;
  const errorMessage = resolvedSearchParams?.error || "";

  if (!categoryId) {
    return (
      <div className="space-y-4">
        <h2 className="font-title text-3xl font-bold text-stone-900">Category Details</h2>
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
        <h2 className="font-title text-3xl font-bold text-stone-900">Category Details</h2>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {categoryResult.error}
        </p>
      </div>
    );
  }

  const category = categoryResult.data;

  async function updateStatusAction(formData) {
    "use server";
    const status = String(formData.get("status") || "");
    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      redirect(`/admin/categories/${categoryId}?error=Invalid%20status`);
    }

    const response = await updateAdminCategoryStatusAction(categoryId, status);

    if (response.error) {
      redirect(`/admin/categories/${categoryId}?error=${encodeURIComponent(response.error)}`);
    }

    redirect(`/admin/categories/${categoryId}`);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-title mt-2 text-3xl font-bold text-stone-900">Category Details</h2>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/categories/${categoryId}/edit`}
            className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
          >
            Edit Category
          </Link>
          <Link
            href="/admin/categories"
            className="rounded-lg border border-stone-300 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200"
          >
            Back to Categories
          </Link>
        </div>
      </header>

      {errorMessage && (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 break-words">
          {errorMessage}
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="font-title text-lg font-semibold text-stone-900">Category Info</h3>
          <dl className="mt-3 space-y-1.5 text-sm text-stone-700">
            <div className="grid grid-cols-[120px_1fr] gap-2"><dt className="font-semibold">Name</dt><dd>{category.name}</dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-2"><dt className="font-semibold">Slug</dt><dd>{category.slug}</dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-2"><dt className="font-semibold">Status</dt><dd>{category.isActive ? "ACTIVE" : "INACTIVE"}</dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-2"><dt className="font-semibold">Featured</dt><dd>{category.isFeatured ? "Yes" : "No"}</dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-2"><dt className="font-semibold">Products</dt><dd>{category._count?.products || 0}</dd></div>
          </dl>
        </article>

        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="font-title text-lg font-semibold text-stone-900">Quick Actions</h3>

          <form action={updateStatusAction} className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-stone-700">Update Status</label>
            <div className="flex gap-2">
              <select
                name="status"
                defaultValue={category.isActive ? "ACTIVE" : "INACTIVE"}
                className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
              <button type="submit" className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100">
                Save
              </button>
            </div>
          </form>

          <div className="mt-6">
            <h4 className="font-semibold text-stone-800">Description</h4>
            <p className="mt-2 text-sm text-stone-600">{category.description || "No description added."}</p>
          </div>
          {category.image && (
            <div className="mt-4 flex justify-start rounded border border-stone-200 bg-stone-50 p-3">
              <img src={category.image} alt={category.name} className="max-h-56 w-auto max-w-full rounded object-contain" />
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
