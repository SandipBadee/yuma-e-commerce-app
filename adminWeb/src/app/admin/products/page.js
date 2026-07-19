/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getAdminCategoryOptionsAction,
  getAdminProductsAction,
  updateAdminProductStatusAction
} from "@/lib/actions";
import ProductStatusSelectForm from "@/components/admin/ProductStatusSelectForm";

const VALID_PRODUCT_STATUSES = ["ACTIVE", "INACTIVE", "DISCONTINUED"];

export default async function AdminProductsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const page = Number(resolvedSearchParams?.page || "1");
  const limit = Number(resolvedSearchParams?.limit || "10");
  const search = resolvedSearchParams?.search || "";
  const status = resolvedSearchParams?.status || "";
  const categoryId = resolvedSearchParams?.categoryId || "";
  const isFeaturedParam = resolvedSearchParams?.isFeatured;
  const sortBy = resolvedSearchParams?.sortBy || "";

  const isFeatured =
    isFeaturedParam === "true" ? true : isFeaturedParam === "false" ? false : undefined;

  const [productsResult, categoriesResult] = await Promise.all([
    getAdminProductsAction({
      page: Number.isNaN(page) ? 1 : page,
      limit: Number.isNaN(limit) ? 10 : limit,
      search,
      categoryId,
      status,
      isFeatured,
      sortBy
    }),
    getAdminCategoryOptionsAction()
  ]);

  const products = productsResult?.data?.products || [];
  const pagination = productsResult?.data?.pagination || { page: 1, totalPages: 1 };
  const categories = categoriesResult?.data?.categories || [];

  const paginationQuery = new URLSearchParams();
  paginationQuery.set("limit", String(limit));
  if (search) paginationQuery.set("search", search);
  if (status) paginationQuery.set("status", status);
  if (categoryId) paginationQuery.set("categoryId", categoryId);
  if (typeof isFeatured === "boolean") paginationQuery.set("isFeatured", String(isFeatured));
  if (sortBy) paginationQuery.set("sortBy", sortBy);

  async function updateProductStatusFormAction(formData) {
    "use server";
    const productId = String(formData.get("productId") || "");
    const nextStatus = String(formData.get("status") || "");
    if (!productId || !VALID_PRODUCT_STATUSES.includes(nextStatus)) return;

    await updateAdminProductStatusAction(productId, nextStatus);
    redirect("/admin/products");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-title mt-2 text-3xl font-bold text-stone-900">Products</h2>
          <p className="mt-2 text-stone-600">Create, update, and manage product catalog and status.</p>
        </div>
        <Link
          href="/admin/products/create"
          className="inline-flex items-center rounded-lg border border-red-300 bg-red-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Create Product
        </Link>
      </header>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <form className="grid grid-cols-1 gap-3 md:grid-cols-6" method="GET">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by name or slug"
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <select
            name="categoryId"
            defaultValue={categoryId}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={status}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="DISCONTINUED">DISCONTINUED</option>
          </select>
          <select
            name="isFeatured"
            defaultValue={isFeaturedParam || ""}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          >
            <option value="">All Featured States</option>
            <option value="true">Featured</option>
            <option value="false">Not Featured</option>
          </select>
          <select
            name="sortBy"
            defaultValue={sortBy}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          >
            <option value="">Newest First</option>
            <option value="stock">Stock</option>
            <option value="discounted_first">Discounted First</option>
            <option value="price">Price</option>
            <option value="max_discount_first">Max Discount First</option>
          </select>
          <button
            type="submit"
            className="rounded-lg border border-stone-300 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200"
          >
            Apply Filters
          </button>
        </form>
      </section>

      {productsResult?.error && (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 break-words">
          {productsResult.error}
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-stone-100 text-stone-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Image</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Featured</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-stone-500">
                    No products found.
                  </td>
                </tr>
              )}

              {products.map((product) => (
                <tr key={product.id} className="border-t border-stone-200">
                  <td className="px-4 py-3">
                    {Array.isArray(product.images) && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded border border-dashed border-stone-300 text-[10px] text-stone-500">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-stone-900">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-stone-900 hover:text-blue-700 hover:underline"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone-700">{product.category?.name || "-"}</td>
                  <td className="px-4 py-3 text-stone-700">
                    {product.salePrice != null ? (
                      <div className="space-y-0.5">
                        <p className="font-semibold text-emerald-700">
                          € {Number(product.salePrice).toFixed(2)} / {product.quantity || 1} {product.unit || "kg"}
                        </p>
                        <p className="text-xs text-stone-500 line-through">
                          € {Number(product.price).toFixed(2)} / {product.quantity || 1} {product.unit || "kg"}
                        </p>
                        <p className="text-[11px] uppercase text-orange-700">{product.discountType || "NONE"}</p>
                      </div>
                    ) : (
                      <p>€ {Number(product.price).toFixed(2)} / {product.quantity || 1} {product.unit || "kg"}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-700">{product.stock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        product.isFeatured
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-stone-200 text-stone-700"
                      }`}
                    >
                      {product.isFeatured ? "Featured" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        product.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800"
                          : product.status === "INACTIVE"
                            ? "bg-stone-200 text-stone-700"
                            : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="rounded-md border border-stone-300 px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="rounded-md border border-blue-300 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/products/${product.id}/reviews`}
                        className="rounded-md border border-violet-300 px-2.5 py-1 text-xs font-medium text-violet-700 hover:bg-violet-50"
                      >
                        Reviews
                      </Link>
                      <ProductStatusSelectForm
                        productId={product.id}
                        currentStatus={product.status}
                        action={updateProductStatusFormAction}
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
            href={`/admin/products?page=${Math.max(1, Number(pagination.page || 1) - 1)}&${paginationQuery.toString()}`}
            className="rounded-lg border border-stone-300 bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-200"
          >
            Previous
          </Link>
          <Link
            href={`/admin/products?page=${Math.min(Number(pagination.totalPages || 1), Number(pagination.page || 1) + 1)}&${paginationQuery.toString()}`}
            className="rounded-lg border border-stone-300 bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-200"
          >
            Next
          </Link>
        </div>
      </section>
    </div>
  );
}
