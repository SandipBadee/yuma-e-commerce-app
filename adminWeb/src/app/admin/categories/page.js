/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getAdminCategoriesAction,
  updateAdminCategoryStatusAction
} from "@/lib/actions";
import CategoryStatusSelectForm from "@/components/admin/CategoryStatusSelectForm";

const VALID_CATEGORY_STATUSES = ["ACTIVE", "INACTIVE"];

export default async function AdminCategoriesPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const page = Number(resolvedSearchParams?.page || "1");
  const limit = Number(resolvedSearchParams?.limit || "10");
  const search = resolvedSearchParams?.search || "";
  const status = resolvedSearchParams?.status || "";

  const categoriesResult = await getAdminCategoriesAction({
    page: Number.isNaN(page) ? 1 : page,
    limit: Number.isNaN(limit) ? 10 : limit,
    search,
    status
  });

  const categories = categoriesResult?.data?.categories || [];
  const pagination = categoriesResult?.data?.pagination || { page: 1, totalPages: 1 };

  const paginationQuery = new URLSearchParams();
  paginationQuery.set("limit", String(limit));
  if (search) paginationQuery.set("search", search);
  if (status) paginationQuery.set("status", status);

  async function updateCategoryStatusFormAction(formData) {
    "use server";
    const categoryId = String(formData.get("categoryId") || "");
    const nextStatus = String(formData.get("status") || "");
    if (!categoryId || !VALID_CATEGORY_STATUSES.includes(nextStatus)) return;

    await updateAdminCategoryStatusAction(categoryId, nextStatus);
    redirect("/admin/categories");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
        <h2 className="font-title mt-2 text-3xl font-bold text-stone-900">Categories</h2>
        <p className="mt-2 text-stone-600">Organize your store categories and menu structure.</p>
        </div>
        <Link
          href="/admin/categories/create"
          className="inline-flex items-center rounded-lg border border-red-300 bg-red-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Create Category
        </Link>
      </header>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <form className="grid grid-cols-1 gap-3 md:grid-cols-3" method="GET">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by name or slug"
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <select
            name="status"
            defaultValue={status}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
          <button
            type="submit"
            className="rounded-lg border border-stone-300 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200"
          >
            Apply Filters
          </button>
        </form>
      </section>

      {categoriesResult?.error && (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 break-words">
          {categoriesResult.error}
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-stone-100 text-stone-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Image</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Products</th>
                <th className="px-4 py-3 font-semibold">Featured</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-stone-500">
                    No categories found.
                  </td>
                </tr>
              )}

              {categories.map((category) => (
                <tr key={category.id} className="border-t border-stone-200">
                  <td className="px-4 py-3">
                    {category.image ? (
                      <img src={category.image} alt={category.name} className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded border border-dashed border-stone-300 text-[10px] text-stone-500">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-stone-900">{category.name}</td>
                  <td className="px-4 py-3 text-stone-700">{category.slug}</td>
                  <td className="px-4 py-3 text-stone-700">{category._count?.products || 0}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        category.isFeatured
                          ? "bg-amber-100 text-amber-800"
                          : "bg-stone-200 text-stone-700"
                      }`}
                    >
                      {category.isFeatured ? "Featured" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        category.isActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700"
                      }`}
                    >
                      {category.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className="rounded-md border border-stone-300 px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/categories/${category.id}/edit`}
                        className="rounded-md border border-blue-300 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                      >
                        Edit
                      </Link>
                      <CategoryStatusSelectForm
                        categoryId={category.id}
                        currentStatus={category.isActive ? "ACTIVE" : "INACTIVE"}
                        action={updateCategoryStatusFormAction}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-stone-600">
          Page {pagination.page} of {pagination.totalPages || 1}
        </p>
        <div className="flex gap-2">
          <Link
            href={`/admin/categories?page=${Math.max(1, Number(pagination.page || 1) - 1)}&${paginationQuery.toString()}`}
            className="rounded-lg border border-stone-300 bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-200"
          >
            Previous
          </Link>
          <Link
            href={`/admin/categories?page=${Math.min(Number(pagination.totalPages || 1), Number(pagination.page || 1) + 1)}&${paginationQuery.toString()}`}
            className="rounded-lg border border-stone-300 bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-200"
          >
            Next
          </Link>
        </div>
      </section>
    </div>
  );
}
