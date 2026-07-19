"use client";

export default function OrderStatusSelectForm({ orderId, currentStatus, action }) {
  return (
    <form action={action} className="flex gap-2">
      <input type="hidden" name="orderId" value={orderId} />
      <select
        name="status"
        defaultValue={currentStatus || "PENDING"}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="rounded-md border border-stone-300 px-2 py-1 text-xs text-stone-700"
      >
        <option value="PENDING">PENDING</option>
        <option value="PROCESSING">PROCESSING</option>
        <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
        <option value="SHIPPED">SHIPPED</option>
        <option value="DELIVERED">DELIVERED</option>
        <option value="COMPLETED">COMPLETED</option>
        <option value="CANCELLED">CANCELLED</option>
        <option value="REFUNDED">REFUNDED</option>
      </select>
    </form>
  );
}
