export default function AdminCartsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-title mt-2 text-3xl font-bold text-stone-900">Carts</h2>
        <p className="mt-2 text-stone-600">
          Track active carts and identify abandonment trends.
        </p>
      </header>

      <section className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-6 shadow-sm">
        <h3 className="font-title text-lg font-semibold text-cyan-900">Cart Activity</h3>
        <p className="mt-2 text-stone-700">
          This section maps to the Cart and CartItem models and will show cart summaries for admin
          monitoring.
        </p>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-stone-600">
          Planned insights: open carts, item counts, stale carts, and products frequently left in
          carts.
        </p>
      </section>
    </div>
  );
}
