import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminOrdersAction, updateAdminOrderStatusAction } from "@/lib/actions";
import OrderStatusSelectForm from "@/components/admin/OrderStatusSelectForm";

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

export default async function AdminOrdersPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const errorMessage = resolvedSearchParams?.error || "";

  const page = Number(resolvedSearchParams?.page || "1");
  const limit = Number(resolvedSearchParams?.limit || "10");
  const search = resolvedSearchParams?.search || "";
  const status = resolvedSearchParams?.status || "";
  const orderType = resolvedSearchParams?.orderType || "";

  const ordersResult = await getAdminOrdersAction({
    page: Number.isNaN(page) ? 1 : page,
    limit: Number.isNaN(limit) ? 10 : limit,
    search,
    status,
    orderType
  });

  const orders = ordersResult?.data?.orders || [];
  const pagination = ordersResult?.data?.pagination || { page: 1, totalPages: 1 };

  const paginationQuery = new URLSearchParams();
  paginationQuery.set("limit", String(limit));
  if (search) paginationQuery.set("search", search);
  if (status) paginationQuery.set("status", status);
  if (orderType) paginationQuery.set("orderType", orderType);

  async function updateOrderStatusFormAction(formData) {
    "use server";
    const orderId = String(formData.get("orderId") || "");
    const nextStatus = String(formData.get("status") || "");
    if (!orderId || !VALID_ORDER_STATUSES.includes(nextStatus)) return;

    const result = await updateAdminOrderStatusAction(orderId, nextStatus);
    if (result?.error) {
      redirect(`/admin/orders?error=${encodeURIComponent(result.error)}`);
    }

    redirect("/admin/orders");
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-title mt-2 text-3xl font-bold text-stone-900">Orders</h2>
        <p className="mt-2 text-stone-600">Track incoming orders and fulfillment status.</p>
      </header>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <form className="grid grid-cols-1 gap-3 md:grid-cols-4" method="GET">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by order number or customer"
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <select
            name="status"
            defaultValue={status}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            {VALID_ORDER_STATUSES.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
          <select
            name="orderType"
            defaultValue={orderType}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          >
            <option value="">All Types</option>
            <option value="DELIVERY">DELIVERY</option>
            <option value="PICKUP">PICKUP</option>
          </select>
          <button
            type="submit"
            className="rounded-lg border border-stone-300 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200"
          >
            Apply Filters
          </button>
        </form>
      </section>

      {ordersResult?.error && (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 break-words">
          {ordersResult.error}
        </section>
      )}

      {errorMessage && (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 break-words">
          {errorMessage}
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-stone-100 text-stone-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Order #</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-stone-500">
                    No orders found.
                  </td>
                </tr>
              )}

              {orders.map((order) => (
                <tr key={order.id} className="border-t border-stone-200">
                  <td className="px-4 py-3 font-medium text-stone-900">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-stone-700">
                    <div>{order.user?.name || "-"}</div>
                    <div className="text-xs text-stone-500">{order.user?.email || "-"}</div>
                  </td>
                  <td className="px-4 py-3 text-stone-700">{order.orderType}</td>
                  <td className="px-4 py-3 text-stone-700">{order._count?.items || 0}</td>
                  <td className="px-4 py-3 text-stone-700">EUR {Number(order.totalAmount || 0).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        order.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : order.status === "PROCESSING"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "SHIPPED" || order.status === "READY_FOR_PICKUP"
                              ? "bg-violet-100 text-violet-800"
                              : order.status === "DELIVERED" || order.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-700">{new Date(order.createdAt).toLocaleDateString("en-US")}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="rounded-md border border-stone-300 px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
                      >
                        View
                      </Link>
                      <OrderStatusSelectForm
                        orderId={order.id}
                        currentStatus={order.status}
                        action={updateOrderStatusFormAction}
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
            href={`/admin/orders?page=${Math.max(1, Number(pagination.page || 1) - 1)}&${paginationQuery.toString()}`}
            className="rounded-lg border border-stone-300 bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-200"
          >
            Previous
          </Link>
          <Link
            href={`/admin/orders?page=${Math.min(Number(pagination.totalPages || 1), Number(pagination.page || 1) + 1)}&${paginationQuery.toString()}`}
            className="rounded-lg border border-stone-300 bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-200"
          >
            Next
          </Link>
        </div>
      </section>
    </div>
  );
}
