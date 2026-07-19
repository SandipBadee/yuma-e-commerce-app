"use client";

import { useState } from "react";

import CloudinaryUpload from "@/components/admin/CloudinaryUpload";

export default function AdminHeroSliderForm({ submitAction, submitLabel, initialValues = {} }) {
  const [images, setImages] = useState(initialValues.image ? [initialValues.image] : []);

  return (
    <form action={submitAction} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <input type="hidden" name="image" value={images[0] || ""} readOnly />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Title</label>
          <input
            type="text"
            name="title"
            defaultValue={initialValues.title || ""}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Subtitle</label>
          <input
            type="text"
            name="subtitle"
            defaultValue={initialValues.subtitle || ""}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Link (optional)</label>
          <input
            type="text"
            name="link"
            defaultValue={initialValues.link || ""}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            placeholder="/products or full URL"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Priority</label>
          <input
            type="number"
            name="priority"
            defaultValue={initialValues.priority ?? 0}
            min="0"
            step="1"
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
      </div>

      <CloudinaryUpload
        folder="hero-slider"
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
