import { redirect } from "next/navigation";

import {
  getAdminSiteSettingsAction,
  updateAdminSiteSettingsAction
} from "@/lib/actions";

export default async function AdminSettingsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const errorMessage = resolvedSearchParams?.error || "";
  const successMessage = resolvedSearchParams?.success || "";

  const settingsResult = await getAdminSiteSettingsAction();
  const settings = settingsResult?.data || null;
  const lastUpdatedLabel = settings?.updatedAt
    ? new Date(settings.updatedAt).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "Not available";

  async function updateSettingsFormAction(formData) {
    "use server";

    const payload = {
      storeName: String(formData.get("storeName") || "").trim(),
      contactEmail: String(formData.get("contactEmail") || "").trim(),
      contactPhone: String(formData.get("contactPhone") || "").trim(),
      deliveryFee: Number(formData.get("deliveryFee") || 0),
      minOrderForFreeDelivery: Number(formData.get("minOrderForFreeDelivery") || 0),
      isStoreOpen: formData.get("isStoreOpen") === "on",
      maintenanceMode: formData.get("maintenanceMode") === "on"
    };

    const result = await updateAdminSiteSettingsAction(payload);
    if (result.error) {
      redirect(`/admin/settings?error=${encodeURIComponent(result.error)}`);
    }

    redirect("/admin/settings?success=Settings%20updated%20successfully");
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-title mt-2 text-3xl font-bold text-stone-900">App Settings</h2>
        <p className="mt-2 text-stone-600">
          Manage global store configuration, delivery rules, and maintenance state.
        </p>
      </header>

      {settingsResult?.error && (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 break-words">
          {settingsResult.error}
        </section>
      )}

      {errorMessage && (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 break-words">
          {errorMessage}
        </section>
      )}

      {successMessage && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 break-words">
          {successMessage}
        </section>
      )}


      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Last Updated</p>
            <p className="mt-1 text-sm font-medium text-stone-800">{lastUpdatedLabel}</p>
          </div>
        </div>

        <form action={updateSettingsFormAction} className="space-y-5">
          <div className="rounded-xl border border-stone-200 p-4">
            <h3 className="text-sm font-semibold text-stone-900">Store Identity</h3>
            <p className="mt-1 text-xs text-stone-500">Core store and contact details.</p>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Store Name</label>
                <input
                  type="text"
                  name="storeName"
                  defaultValue={settings?.storeName || "YUMA Ecommerce"}
                  required
                  minLength={2}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  defaultValue={settings?.contactEmail || ""}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  placeholder="support@example.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Contact Phone</label>
                <input
                  type="text"
                  name="contactPhone"
                  defaultValue={settings?.contactPhone || ""}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  placeholder="+31 ..."
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 p-4">
            <h3 className="text-sm font-semibold text-stone-900">Delivery Rules</h3>
            <p className="mt-1 text-xs text-stone-500">Pricing configuration used during checkout.</p>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Delivery Fee (EUR)</label>
                <input
                  type="number"
                  name="deliveryFee"
                  defaultValue={Number(settings?.deliveryFee || 0)}
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Min Order For Free Delivery (EUR)</label>
                <input
                  type="number"
                  name="minOrderForFreeDelivery"
                  defaultValue={Number(settings?.minOrderForFreeDelivery || 0)}
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 p-4">
            <h3 className="text-sm font-semibold text-stone-900">Store Availability</h3>
            <p className="mt-1 text-xs text-stone-500">Operational flags for storefront behavior.</p>

            <div className="mt-4 flex flex-col gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-stone-700">
                <input
                  type="checkbox"
                  name="isStoreOpen"
                  defaultChecked={Boolean(settings?.isStoreOpen)}
                  className="h-4 w-4 rounded border-stone-300"
                />
                Store is open for orders
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-stone-700">
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  defaultChecked={Boolean(settings?.maintenanceMode)}
                  className="h-4 w-4 rounded border-stone-300"
                />
                Enable maintenance mode
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="rounded-lg border border-red-300 bg-red-800 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Save Settings
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
