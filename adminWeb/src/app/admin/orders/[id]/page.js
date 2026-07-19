import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminOrderByIdAction, updateAdminOrderStatusAction } from "@/lib/actions";

const VALID_ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "READY_FOR_PICKUP",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED"
];

export default async function AdminOrderDetailsPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const orderId = resolvedParams?.id;
  const errorMessage = resolvedSearchParams?.error || "";

  if (!orderId) {
    return (
      <div className="space-y-4">
        <h2 className="font-title text-3xl font-bold text-stone-900">Order Details</h2>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Invalid order id provided.
        </p>
      </div>
    );
  }

  const orderResult = await getAdminOrderByIdAction(orderId);

  if (orderResult.error) {
    return (
      <div className="space-y-4">
        <h2 className="font-title text-3xl font-bold text-stone-900">Order Details</h2>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {orderResult.error}
        </p>
      </div>
    );
  }

  const order = orderResult.data?.order;
  const pricing = orderResult.data?.pricing;

  async function updateStatusAction(formData) {
    "use server";
    const status = String(formData.get("status") || "");
    if (!VALID_ORDER_STATUSES.includes(status)) {
      redirect(`/admin/orders/${orderId}?error=Invalid%20status`);
    }

    const response = await updateAdminOrderStatusAction(orderId, status);

    if (response.error) {
      redirect(`/admin/orders/${orderId}?error=${encodeURIComponent(response.error)}`);
    }

    redirect(`/admin/orders/${orderId}`);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-title mt-2 text-3xl font-bold text-stone-900">Order Details</h2>
          <p className="mt-2 text-stone-600">Order #{order.orderNumber}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/orders"
            className="rounded-lg border border-stone-300 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200"
          >
            Back to Orders
          </Link>
        </div>
      </header>

      {errorMessage && (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 break-words">
          {errorMessage}
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="font-title text-lg font-semibold text-stone-900">Order Info</h3>
          <dl className="mt-3 space-y-1.5 text-sm text-stone-700">
            <div className="grid grid-cols-[140px_1fr] gap-2"><dt className="font-semibold">Order Number</dt><dd>{order.orderNumber}</dd></div>
            <div className="grid grid-cols-[140px_1fr] gap-2"><dt className="font-semibold">Status</dt><dd>{order.status}</dd></div>
            <div className="grid grid-cols-[140px_1fr] gap-2"><dt className="font-semibold">Type</dt><dd>{order.orderType}</dd></div>
            <div className="grid grid-cols-[140px_1fr] gap-2"><dt className="font-semibold">Phone</dt><dd>{order.phone || "-"}</dd></div>
            <div className="grid grid-cols-[140px_1fr] gap-2"><dt className="font-semibold">Address</dt><dd>{order.shippingAddress || "-"}</dd></div>
            <div className="grid grid-cols-[140px_1fr] gap-2"><dt className="font-semibold">Customer</dt><dd>{order.user?.name || "-"}</dd></div>
            <div className="grid grid-cols-[140px_1fr] gap-2"><dt className="font-semibold">Email</dt><dd>{order.user?.email || "-"}</dd></div>
            <div className="grid grid-cols-[140px_1fr] gap-2"><dt className="font-semibold">Created</dt><dd>{new Date(order.createdAt).toLocaleString("en-US")}</dd></div>
          </dl>
        </article>

        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="font-title text-lg font-semibold text-stone-900">Status & Pricing</h3>

          <form action={updateStatusAction} className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-stone-700">Update Status</label>
            <div className="flex gap-2">
              <select
                name="status"
                defaultValue={order.status}
                className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
              >
                {VALID_ORDER_STATUSES.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
              <button type="submit" className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100">
                Save
              </button>
            </div>
          </form>

          <dl className="mt-6 space-y-1.5 text-sm text-stone-700">
            <div className="grid grid-cols-[120px_1fr] gap-2"><dt className="font-semibold">Subtotal</dt><dd>EUR {Number(pricing?.subtotal || 0).toFixed(2)}</dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-2"><dt className="font-semibold">Delivery Fee</dt><dd>EUR {Number(pricing?.deliveryFee || 0).toFixed(2)}</dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-2"><dt className="font-semibold">Total</dt><dd className="font-semibold">EUR {Number(pricing?.totalAmount || 0).toFixed(2)}</dd></div>
          </dl>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-stone-100 text-stone-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Qty</th>
                <th className="px-4 py-3 font-semibold">Unit Price</th>
                <th className="px-4 py-3 font-semibold">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item) => (
                <tr key={item.id} className="border-t border-stone-200">
                  <td className="px-4 py-3 text-stone-900 font-medium">{item.product?.name || "Product"}</td>
                  <td className="px-4 py-3 text-stone-700">{item.quantity}</td>
                  <td className="px-4 py-3 text-stone-700">EUR {Number(item.price || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-stone-700">EUR {(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
