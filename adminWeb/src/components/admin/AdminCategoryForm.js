"use client";

import { useState } from "react";

import CloudinaryUpload from "@/components/admin/CloudinaryUpload";

export default function AdminCategoryForm({ submitAction, submitLabel, initialValues = {} }) {
  const [images, setImages] = useState(initialValues.image ? [initialValues.image] : []);

  return (
    <form action={submitAction} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <input type="hidden" name="image" value={images[0] || ""} readOnly />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Category Name</label>
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

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-stone-700">Description</label>
          <textarea
            name="description"
            defaultValue={initialValues.description || ""}
            rows={4}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
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
          </select>
        </div>

        <label className="mt-7 inline-flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={Boolean(initialValues.isFeatured)}
            className="h-4 w-4 rounded border-stone-300"
          />
          Featured category on home page
        </label>
      </div>

      <CloudinaryUpload
        folder="categories"
        initialImages={images}
        onUploadsChange={(nextImages) => setImages(nextImages.slice(0, 1))}
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
