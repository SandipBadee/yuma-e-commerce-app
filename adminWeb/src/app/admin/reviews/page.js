export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-title mt-2 text-3xl font-bold text-stone-900">Product Reviews</h2>
        <p className="mt-2 text-stone-600">
          Moderate customer feedback and monitor product quality signals.
        </p>
      </header>

      <section className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-6 shadow-sm">
        <h3 className="font-title text-lg font-semibold text-violet-900">Review Moderation</h3>
        <p className="mt-2 text-stone-700">
          This section maps to the ProductReview model and will support filtering by rating, product,
          and recent activity.
        </p>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-stone-600">
          Planned actions: review comments, investigate low ratings, and remove abusive feedback.
        </p>
      </section>
    </div>
  );
}
