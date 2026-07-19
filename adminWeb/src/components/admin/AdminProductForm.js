"use client";

import { useMemo, useState } from "react";

import BarcodeScannerButton from "@/components/admin/BarcodeScannerButton";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";

export default function AdminProductForm({
  submitAction,
  categories,
  submitLabel,
  initialValues = {},
  categoryLoadError = ""
}) {
  const [images, setImages] = useState(initialValues.images || []);
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialValues.categoryId || "");
  const [productCode, setProductCode] = useState(initialValues.productCode || "");
  const [discountType, setDiscountType] = useState(initialValues.discountType || "NONE");
  const [unit, setUnit] = useState(initialValues.unit || "kg");

  const unitExamples = ["kg", "lr", "ml", "gm", "kpl", "cm"];

  const categoryOptions = useMemo(() => categories || [], [categories]);
  const filteredCategoryOptions = useMemo(() => {
    const keyword = categorySearch.trim().toLowerCase();
    if (!keyword) {
      return categoryOptions;
    }

    return categoryOptions.filter((category) => {
      const normalized = `${category.name} ${category.slug || ""}`.toLowerCase();
      return normalized.includes(keyword);
    });
  }, [categoryOptions, categorySearch]);

  return (
    <form action={submitAction} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <input type="hidden" name="imagesJson" value={JSON.stringify(images)} readOnly />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Product Name</label>
          <input
            type="text"
            name="name"
            defaultValue={initialValues.name || ""}
            required
            minLength={2}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Slug (optional)</label>
          <input
            type="text"
            name="slug"
            defaultValue={initialValues.slug || ""}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            placeholder="auto-generated-if-empty"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Price</label>
          <input
            type="number"
            name="price"
            defaultValue={initialValues.price ?? ""}
            required
            min="0"
            step="0.01"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Discount Type</label>
          <select
            name="discountType"
            value={discountType}
            onChange={(event) => setDiscountType(event.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          >
            <option value="NONE">NONE</option>
            <option value="PERCENTAGE">PERCENTAGE</option>
            <option value="FLAT">FLAT</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Sale Price (optional)</label>
          <input
            type="number"
            name="salePrice"
            defaultValue={initialValues.salePrice ?? ""}
            min="0"
            step="0.01"
            disabled={discountType === "NONE"}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-stone-100"
          />
          <p className="mt-1 text-xs text-stone-500">
            Required when discount type is PERCENTAGE or FLAT.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Stock</label>
          <input
            type="number"
            name="stock"
            defaultValue={initialValues.stock ?? 100}
            required
            min="0"
            step="1"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Quantity</label>
          <input
            type="number"
            name="quantity"
            defaultValue={initialValues.quantity ?? 1}
            required
            min="1"
            step="1"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Product Code (Barcode)</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              name="productCode"
              value={productCode}
              onChange={(event) => setProductCode(event.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              placeholder="Scan or type barcode"
            />
            <BarcodeScannerButton onDetected={setProductCode} />
          </div>
          <p className="mt-1 text-xs text-stone-500">Optional, but must be unique if provided.</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Unit</label>
          <input
            type="text"
            name="unit"
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {unitExamples.map((exampleUnit) => (
              <button
                key={exampleUnit}
                type="button"
                onClick={() => setUnit(exampleUnit)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  unit.trim().toLowerCase() === exampleUnit
                    ? "border-red-300 bg-red-50 text-red-800"
                    : "border-stone-300 bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {exampleUnit}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Category</label>
          <input
            type="search"
            value={categorySearch}
            onChange={(event) => setCategorySearch(event.target.value)}
            placeholder="Search category by name or slug"
            className="mb-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <select
            name="categoryId"
            value={selectedCategoryId}
            onChange={(event) => setSelectedCategoryId(event.target.value)}
            required
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          >
            <option value="">Select category</option>
            {filteredCategoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {categoryLoadError && (
            <p className="mt-1 text-xs text-red-700">Could not load categories: {categoryLoadError}</p>
          )}
          {!categoryLoadError && categoryOptions.length === 0 && (
            <p className="mt-1 text-xs text-amber-700">No categories found. Create a category first.</p>
          )}
          {categoryOptions.length > 0 && (
            <p className="mt-1 text-xs text-stone-500">
              Showing {filteredCategoryOptions.length} of {categoryOptions.length} categories
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Status</label>
          <select
            name="status"
            defaultValue={initialValues.status || "ACTIVE"}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="DISCONTINUED">DISCONTINUED</option>
          </select>
        </div>

        <label className="mt-7 inline-flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={Boolean(initialValues.isFeatured)}
            className="h-4 w-4 rounded border-stone-300"
          />
          Featured product
        </label>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Description</label>
        <textarea
          name="description"
          defaultValue={initialValues.description || ""}
          rows={4}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
      </div>

      <CloudinaryUpload
        folder="products"
        initialImages={initialValues.images || []}
        onUploadsChange={setImages}
      />

      <div>
        <button
          type="submit"
          className="rounded-lg border border-red-300 bg-red-800 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
