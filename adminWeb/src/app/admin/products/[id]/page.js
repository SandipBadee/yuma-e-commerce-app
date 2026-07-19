import Link from "next/link";
import { redirect } from "next/navigation";
/* eslint-disable @next/next/no-img-element */

import {
  getAdminProductByIdAction,
  updateAdminProductStatusAction
} from "@/lib/actions";

export default async function AdminProductDetailsPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const productId = resolvedParams?.id;
  const errorMessage = resolvedSearchParams?.error || "";

  if (!productId) {
    return (
      <div className="space-y-4">
        <h2 className="font-title text-3xl font-bold text-stone-900">Product Details</h2>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Invalid product id provided.
        </p>
      </div>
    );
  }

  const productResult = await getAdminProductByIdAction(productId);

  if (productResult.error) {
    return (
      <div className="space-y-4">
        <h2 className="font-title text-3xl font-bold text-stone-900">Product Details</h2>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {productResult.error}
        </p>
      </div>
    );
  }

  const product = productResult.data;

  async function updateStatusAction(formData) {
    "use server";
    const status = String(formData.get("status") || "");
    if (!["ACTIVE", "INACTIVE", "DISCONTINUED"].includes(status)) {
      redirect(`/admin/products/${productId}?error=Invalid%20status`);
    }

    const response = await updateAdminProductStatusAction(productId, status);

    if (response.error) {
      redirect(`/admin/products/${productId}?error=${encodeURIComponent(response.error)}`);
    }

    redirect(`/admin/products/${productId}`);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-title mt-2 text-3xl font-bold text-stone-900">Product Details</h2>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/products/${productId}/edit`}
            className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
          >
            Edit Product
          </Link>
          <Link
            href="/admin/products"
            className="rounded-lg border border-stone-300 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200"
          >
            Back to Products
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
          <h3 className="font-title text-lg font-semibold text-stone-900">Product Info</h3>
          <dl className="mt-3 space-y-1.5 text-sm text-stone-700">
            <div className="grid grid-cols-[120px_1fr] gap-2"><dt className="font-semibold">Name</dt><dd>{product.name}</dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-2"><dt className="font-semibold">Slug</dt><dd>{product.slug}</dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-2"><dt className="font-semibold">Category</dt><dd>{product.category?.name || "-"}</dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-2"><dt className="font-semibold">Product Code</dt><dd>{product.productCode || "-"}</dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-2"><dt className="font-semibold">Price</dt><dd>€ {Number(product.price).toFixed(2)} / {product.quantity || 1} {product.unit || "kg"}</dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-2"><dt className="font-semibold">Sale Price</dt><dd>{product.salePrice == null ? "-" : `€ ${Number(product.salePrice).toFixed(2)} / ${product.quantity || 1} ${product.unit || "kg"}`}</dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-2"><dt className="font-semibold">Discount Type</dt><dd>{product.discountType || "NONE"}</dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-2"><dt className="font-semibold">Stock</dt><dd>{product.stock}</dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-2"><dt className="font-semibold">Quantity</dt><dd>{product.quantity}</dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-2"><dt className="font-semibold">Unit</dt><dd>{product.unit}</dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-2"><dt className="font-semibold">Status</dt><dd>{product.status}</dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-2"><dt className="font-semibold">Featured</dt><dd>{product.isFeatured ? "Yes" : "No"}</dd></div>
          </dl>
        </article>

        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="font-title text-lg font-semibold text-stone-900">Quick Actions</h3>

          <form action={updateStatusAction} className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-stone-700">Update Status</label>
            <div className="flex gap-2">
              <select
                name="status"
                defaultValue={product.status}
                className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="DISCONTINUED">DISCONTINUED</option>
              </select>
              <button type="submit" className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100">
                Save
              </button>
            </div>
          </form>

          <div className="mt-6">
            <h4 className="font-semibold text-stone-800">Images</h4>
            {Array.isArray(product.images) && product.images.length > 0 ? (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {product.images.map((url) => (
                  <div key={url} className="flex min-h-[120px] items-center justify-center rounded border border-stone-200 bg-stone-50 p-2">
                    <img src={url} alt={product.name} className="max-h-44 w-auto max-w-full rounded object-contain" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-stone-500">No images attached.</p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
