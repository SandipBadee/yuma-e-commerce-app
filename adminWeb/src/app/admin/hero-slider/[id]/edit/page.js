import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getAdminHeroSliderByIdAction,
  updateAdminHeroSliderAction
} from "@/lib/actions";
import AdminHeroSliderForm from "@/components/admin/AdminHeroSliderForm";

export default async function EditAdminHeroSliderPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const sliderId = resolvedParams?.id;
  const errorMessage = resolvedSearchParams?.error || "";

  if (!sliderId) {
    return (
      <div className="space-y-4">
        <h2 className="font-title text-3xl font-bold text-stone-900">Edit Hero Slider</h2>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Invalid slider id provided.
        </p>
      </div>
    );
  }

  const sliderResult = await getAdminHeroSliderByIdAction(sliderId);
  if (sliderResult.error) {
    return (
      <div className="space-y-4">
        <h2 className="font-title text-3xl font-bold text-stone-900">Edit Hero Slider</h2>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {sliderResult.error}
        </p>
      </div>
    );
  }

  const slider = sliderResult.data;

  async function updateHeroSliderFormAction(formData) {
    "use server";

    const payload = {
      title: String(formData.get("title") || "").trim(),
      subtitle: String(formData.get("subtitle") || "").trim(),
      image: String(formData.get("image") || "").trim(),
      link: String(formData.get("link") || "").trim(),
      priority: Number(formData.get("priority") || 0),
      status: String(formData.get("status") || "ACTIVE")
    };

    const result = await updateAdminHeroSliderAction(sliderId, payload);
    if (result.error) {
      redirect(`/admin/hero-slider/${sliderId}/edit?error=${encodeURIComponent(result.error)}`);
    }

    redirect("/admin/hero-slider");
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-title mt-2 text-3xl font-bold text-stone-900">Edit Hero Slider</h2>
          <p className="mt-2 text-stone-600">Update slide content and publication status.</p>
        </div>
        <Link
          href="/admin/hero-slider"
          className="rounded-lg border border-stone-300 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200"
        >
          Back to Hero Slider
        </Link>
      </header>

      {errorMessage && (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 break-words">
          {errorMessage}
        </section>
      )}

      <AdminHeroSliderForm
        submitAction={updateHeroSliderFormAction}
        submitLabel="Save Changes"
        initialValues={{
          title: slider.title,
          subtitle: slider.subtitle,
          image: slider.image,
          link: slider.link,
          priority: slider.priority,
          status: slider.isActive ? "ACTIVE" : "INACTIVE"
        }}
      />
    </div>
  );
}
