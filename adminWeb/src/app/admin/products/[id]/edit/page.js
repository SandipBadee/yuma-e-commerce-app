import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getAdminCategoryOptionsAction,
  getAdminProductByIdAction,
  updateAdminProductAction
} from "@/lib/actions";
import AdminProductForm from "@/components/admin/AdminProductForm";

export default async function EditAdminProductPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const productId = resolvedParams?.id;
  const errorMessage = resolvedSearchParams?.error || "";

  if (!productId) {
    return (
      <div className="space-y-4">
        <h2 className="font-title text-3xl font-bold text-stone-900">Edit Product</h2>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Invalid product id provided.
        </p>
      </div>
    );
  }

  const [productResult, categoriesResult] = await Promise.all([
    getAdminProductByIdAction(productId),
    getAdminCategoryOptionsAction()
  ]);

  if (productResult.error) {
    return (
      <div className="space-y-4">
        <h2 className="font-title text-3xl font-bold text-stone-900">Edit Product</h2>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {productResult.error}
        </p>
      </div>
    );
  }

  const product = productResult.data;
  const categories = categoriesResult?.data?.categories || [];
  const categoryLoadError = categoriesResult?.error || "";

  async function updateProductFormAction(formData) {
    "use server";

    const payload = {
      name: String(formData.get("name") || "").trim(),
      slug: String(formData.get("slug") || "").trim(),
      productCode: String(formData.get("productCode") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      price: Number(formData.get("price") || 0),
      salePrice:
        String(formData.get("salePrice") || "").trim() === ""
          ? null
          : Number(formData.get("salePrice")),
      discountType: String(formData.get("discountType") || "NONE"),
      stock: Number(formData.get("stock") || 1),
      quantity: Number(formData.get("quantity") || 1),
      unit: String(formData.get("unit") || "kg").trim(),
      categoryId: String(formData.get("categoryId") || ""),
      status: String(formData.get("status") || "ACTIVE"),
      isFeatured: formData.get("isFeatured") === "on"
    };

    if (payload.discountType === "NONE") {
      payload.salePrice = null;
    }

    const imagesJson = String(formData.get("imagesJson") || "[]");
    let images = [];

    try {
      images = JSON.parse(imagesJson);
    } catch (_error) {
      images = [];
    }

    payload.images = Array.isArray(images) ? images : [];

    const result = await updateAdminProductAction(productId, payload);
    if (result.error) {
      redirect(`/admin/products/${productId}/edit?error=${encodeURIComponent(result.error)}`);
    }

    redirect(`/admin/products/${productId}`);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-title mt-2 text-3xl font-bold text-stone-900">Edit Product</h2>
          <p className="mt-2 text-stone-600">Update product details and cloud-hosted images.</p>
        </div>
        <Link
          href={`/admin/products/${productId}`}
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

      <AdminProductForm
        submitAction={updateProductFormAction}
        categories={categories}
        submitLabel="Save Changes"
        categoryLoadError={categoryLoadError}
        initialValues={{
          name: product.name,
          slug: product.slug,
          productCode: product.productCode,
          description: product.description,
          price: Number(product.price),
          salePrice: product.salePrice == null ? "" : Number(product.salePrice),
          discountType: product.discountType || "NONE",
          stock: product.stock,
          quantity: product.quantity,
          unit: product.unit,
          categoryId: product.category?.id,
          status: product.status,
          isFeatured: product.isFeatured,
          images: product.images || []
        }}
      />
    </div>
  );
}
