import { redirect } from "next/navigation";

import AdminDashboardBarcodeLookup from "@/components/admin/AdminDashboardBarcodeLookup";
import { getAdminDashboardDetailsAction, getAdminProductByCodeAction } from "@/lib/actions";

export default async function AdminDashboardPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const scanErrorMessage = resolvedSearchParams?.scanError || "";
  const barcodeValue = resolvedSearchParams?.barcode || "";

  const dashboardResult = await getAdminDashboardDetailsAction();
  const details = dashboardResult?.data || null;

  const stats = {
    totalUsers: details?.totalUsers ?? 0,
    totalProducts: details?.totalProducts ?? 0,
    totalOrders: details?.totalOrders ?? 0,
    pendingOrders: details?.pendingOrders ?? 0
  };

  async function lookupProductByBarcodeAction(formData) {
    "use server";

    const barcode = String(formData.get("barcode") || "").trim();

    if (!barcode) {
      redirect("/admin?scanError=Please%20scan%20or%20enter%20a%20barcode");
    }

    const result = await getAdminProductByCodeAction(barcode);

    if (result?.error) {
      redirect(`/admin?scanError=${encodeURIComponent(result.error)}&barcode=${encodeURIComponent(barcode)}`);
    }

    const productId = result?.data?.id;
    if (!productId) {
      redirect(`/admin?scanError=${encodeURIComponent("No product found for this barcode")}&barcode=${encodeURIComponent(barcode)}`);
    }

    redirect(`/admin/products/${productId}`);
  }

  return (
    <div className="space-y-8">
      <header>
                  <h2 className="font-title mt-2 text-3xl font-bold text-stone-900">Admin Dashboard</h2>

        <p className="mt-2 max-w-2xl text-stone-600">
          Monitor platform activity and manage core modules from one place.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-red-800">Total Users</p>
          <p className="mt-3 text-3xl font-bold text-red-900">{stats.totalUsers}</p>
        </article>

        <article className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-amber-800">Total Products</p>
          <p className="mt-3 text-3xl font-bold text-amber-900">{stats.totalProducts}</p>
        </article>

        <article className="rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-100 to-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-stone-700">Total Orders</p>
          <p className="mt-3 text-3xl font-bold text-stone-900">{stats.totalOrders}</p>
        </article>

        <article className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-orange-800">Pending Orders</p>
          <p className="mt-3 text-3xl font-bold text-orange-900">{stats.pendingOrders}</p>
        </article>
      </section>

      <AdminDashboardBarcodeLookup
        action={lookupProductByBarcodeAction}
        errorMessage={scanErrorMessage}
        initialBarcode={barcodeValue}
      />

 
    </div>
  );
}