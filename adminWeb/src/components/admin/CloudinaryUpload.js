"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useRef, useState } from "react";

const optimizeCloudinaryUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  if (!url.includes("/upload/")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
};

export default function CloudinaryUpload({
  onUploadSuccess,
  onUploadsChange,
  folder = "products",
  initialImages = []
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState(initialImages);
  const fileInputRef = useRef(null);

  const missingConfig = useMemo(() => {
    return !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;
  }, []);

  const syncImages = (nextImages) => {
    setImages(nextImages);
    if (onUploadsChange) onUploadsChange(nextImages);
    if (onUploadSuccess) onUploadSuccess(nextImages[nextImages.length - 1] || "");
  };

  const handleFileUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    if (missingConfig) {
      setError("Cloudinary config missing. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_PRESET.");
      return;
    }

    setLoading(true);
    setError("");

    const uploadedUrls = [];

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);
        formData.append("folder", folder);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );

        const data = await response.json();

        if (!response.ok || !data.secure_url) {
          throw new Error(data.error?.message || "Upload failed");
        }

        uploadedUrls.push(optimizeCloudinaryUrl(data.secure_url));
      }

      syncImages([...images, ...uploadedUrls]);
      event.target.value = "";
    } catch (uploadError) {
      setError(uploadError.message || "Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (imageUrl) => {
    const nextImages = images.filter((item) => item !== imageUrl);
    syncImages(nextImages);
  };

  const openPicker = () => {
    fileInputRef.current?.click();
  };

  const entityLabel = folder === "categories" ? "category" : "product";

  return (
    <div className="space-y-4 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-red-800">Upload {entityLabel} images</p>
          <p className="text-xs text-stone-500">
            Upload one or more images. They are stored in Cloudinary and optimized automatically.
          </p>
        </div>
        {images.length > 0 && (
          <button
            type="button"
            onClick={openPicker}
            className="shrink-0 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100"
          >
            + Add More
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*"
        multiple
      />

      {loading && <p className="text-sm font-medium text-amber-700">Uploading images...</p>}
      {error && <p className="text-sm font-medium text-red-700">{error}</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((url) => (
          <div key={url} className="rounded-lg border border-stone-200 bg-white p-2">
            <div className="flex h-24 items-center justify-center overflow-hidden rounded bg-stone-50">
              <img src={url} alt="Uploaded preview" className="max-h-full w-auto max-w-full object-contain" />
            </div>
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="mt-2 w-full rounded border border-red-300 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={openPicker}
          className="flex h-[132px] items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-white text-xs font-medium text-stone-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
        >
          + Add Image
        </button>
      </div>
      
      {images.length > 0 && (
        <div className="text-xs text-stone-500">
          {images.length} image{images.length > 1 ? "s" : ""} selected.
        </div>
      )}
    </div>
  );
}
