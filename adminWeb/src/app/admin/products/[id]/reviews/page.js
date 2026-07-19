import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getAdminProductReviewsAction,
  updateAdminReviewStatusAction
} from "@/lib/actions";
import ReviewStatusSelectForm from "@/components/admin/ReviewStatusSelectForm";

const VALID_REVIEW_STATUSES = ["ACTIVE", "INACTIVE"];

export default async function AdminProductReviewsPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const productId = resolvedParams?.id;

  if (!productId) {
    return (
      <div className="space-y-4">
        <h2 className="font-title text-3xl font-bold text-stone-900">Product Reviews</h2>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Invalid product id provided.
        </p>
      </div>
    );
  }

  const page = Number(resolvedSearchParams?.page || "1");
  const limit = Number(resolvedSearchParams?.limit || "10");
  const status = resolvedSearchParams?.status || "";
  const search = resolvedSearchParams?.search || "";

  const reviewsResult = await getAdminProductReviewsAction(productId, {
    page: Number.isNaN(page) ? 1 : page,
    limit: Number.isNaN(limit) ? 10 : limit,
    status,
    search
  });

  const product = reviewsResult?.data?.product;
  const reviews = reviewsResult?.data?.reviews || [];
  const pagination = reviewsResult?.data?.pagination || { page: 1, totalPages: 1 };

  const paginationQuery = new URLSearchParams();
  paginationQuery.set("limit", String(limit));
  if (status) paginationQuery.set("status", status);
  if (search) paginationQuery.set("search", search);

  async function updateReviewStatusFormAction(formData) {
    "use server";
    const reviewId = String(formData.get("reviewId") || "");
    const nextStatus = String(formData.get("status") || "");
    if (!reviewId || !VALID_REVIEW_STATUSES.includes(nextStatus)) return;

    await updateAdminReviewStatusAction(reviewId, nextStatus);
    redirect(`/admin/products/${productId}/reviews?${paginationQuery.toString()}`);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-title mt-2 text-3xl font-bold text-stone-900">Product Reviews</h2>
          <p className="mt-2 text-stone-600">
            {product ? `Moderating reviews for ${product.name}.` : "Moderating reviews for selected product."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/products/${productId}`}
            className="rounded-lg border border-stone-300 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200"
          >
            Product Details
          </Link>
          <Link
            href="/admin/products"
            className="rounded-lg border border-stone-300 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200"
          >
            Back to Products
          </Link>
        </div>
      </header>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <form className="grid grid-cols-1 gap-3 md:grid-cols-3" method="GET">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by comment, user name, or email"
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

      {reviewsResult?.error && (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 break-words">
          {reviewsResult.error}
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-stone-100 text-stone-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Reviewer</th>
                <th className="px-4 py-3 font-semibold">Rating</th>
                <th className="px-4 py-3 font-semibold">Comment</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-stone-500">
                    No reviews found for this product.
                  </td>
                </tr>
              )}

              {reviews.map((review) => (
                <tr key={review.id} className="border-t border-stone-200">
                  <td className="px-4 py-3 text-stone-700">
                    <p className="font-medium text-stone-900">{review.user?.name || "Unknown user"}</p>
                    <p className="text-xs text-stone-500">{review.user?.email || "-"}</p>
                  </td>
                  <td className="px-4 py-3 text-stone-700">{review.rating}/5</td>
                  <td className="px-4 py-3 text-stone-700">{review.comment || "-"}</td>
                  <td className="px-4 py-3 text-stone-700">{new Date(review.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        review.isActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700"
                      }`}
                    >
                      {review.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ReviewStatusSelectForm
                      reviewId={review.id}
                      currentStatus={review.isActive ? "ACTIVE" : "INACTIVE"}
                      action={updateReviewStatusFormAction}
                    />
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
            href={`/admin/products/${productId}/reviews?page=${Math.max(1, Number(pagination.page || 1) - 1)}&${paginationQuery.toString()}`}
            className="rounded-lg border border-stone-300 bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-200"
          >
            Previous
          </Link>
          <Link
            href={`/admin/products/${productId}/reviews?page=${Math.min(Number(pagination.totalPages || 1), Number(pagination.page || 1) + 1)}&${paginationQuery.toString()}`}
            className="rounded-lg border border-stone-300 bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-200"
          >
            Next
          </Link>
        </div>
      </section>
    </div>
  );
}
