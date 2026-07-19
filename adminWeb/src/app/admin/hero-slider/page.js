/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getAdminHeroSlidersAction,
  updateAdminHeroSliderStatusAction
} from "@/lib/actions";
import HeroSliderStatusSelectForm from "@/components/admin/HeroSliderStatusSelectForm";

const VALID_HERO_SLIDER_STATUSES = ["ACTIVE", "INACTIVE"];

export default async function AdminHeroSliderPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const page = Number(resolvedSearchParams?.page || "1");
  const limit = Number(resolvedSearchParams?.limit || "10");
  const search = resolvedSearchParams?.search || "";
  const status = resolvedSearchParams?.status || "";

  const slidersResult = await getAdminHeroSlidersAction({
    page: Number.isNaN(page) ? 1 : page,
    limit: Number.isNaN(limit) ? 10 : limit,
    search,
    status
  });

  const sliders = slidersResult?.data?.sliders || [];
  const pagination = slidersResult?.data?.pagination || { page: 1, totalPages: 1 };

  const paginationQuery = new URLSearchParams();
  paginationQuery.set("limit", String(limit));
  if (search) paginationQuery.set("search", search);
  if (status) paginationQuery.set("status", status);

  async function updateHeroSliderStatusFormAction(formData) {
    "use server";
    const sliderId = String(formData.get("sliderId") || "");
    const nextStatus = String(formData.get("status") || "");
    if (!sliderId || !VALID_HERO_SLIDER_STATUSES.includes(nextStatus)) return;

    await updateAdminHeroSliderStatusAction(sliderId, nextStatus);
    redirect("/admin/hero-slider");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-title mt-2 text-3xl font-bold text-stone-900">Hero Slider</h2>
          <p className="mt-2 text-stone-600">Manage homepage hero slides, links, and publish status.</p>
        </div>
        <Link
          href="/admin/hero-slider/create"
          className="inline-flex items-center rounded-lg border border-red-300 bg-red-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Create Slide
        </Link>
      </header>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <form className="grid grid-cols-1 gap-3 md:grid-cols-3" method="GET">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by title or subtitle"
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

      {slidersResult?.error && (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 break-words">
          {slidersResult.error}
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-stone-100 text-stone-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Image</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Subtitle</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sliders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-stone-500">
                    No hero slides found.
                  </td>
                </tr>
              )}

              {sliders.map((slider) => (
                <tr key={slider.id} className="border-t border-stone-200">
                  <td className="px-4 py-3">
                    <img src={slider.image} alt={slider.title || "Hero slide"} className="h-10 w-16 rounded object-cover" />
                  </td>
                  <td className="px-4 py-3 font-medium text-stone-900">{slider.title || "-"}</td>
                  <td className="px-4 py-3 text-stone-700">{slider.subtitle || "-"}</td>
                  <td className="px-4 py-3 text-stone-700">{slider.priority}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        slider.isActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700"
                      }`}
                    >
                      {slider.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/hero-slider/${slider.id}/edit`}
                        className="rounded-md border border-blue-300 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                      >
                        Edit
                      </Link>
                      <HeroSliderStatusSelectForm
                        sliderId={slider.id}
                        currentStatus={slider.isActive ? "ACTIVE" : "INACTIVE"}
                        action={updateHeroSliderStatusFormAction}
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
            href={`/admin/hero-slider?page=${Math.max(1, Number(pagination.page || 1) - 1)}&${paginationQuery.toString()}`}
            className="rounded-lg border border-stone-300 bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-200"
          >
            Previous
          </Link>
          <Link
            href={`/admin/hero-slider?page=${Math.min(Number(pagination.totalPages || 1), Number(pagination.page || 1) + 1)}&${paginationQuery.toString()}`}
            className="rounded-lg border border-stone-300 bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-200"
          >
            Next
          </Link>
        </div>
      </section>
    </div>
  );
}
