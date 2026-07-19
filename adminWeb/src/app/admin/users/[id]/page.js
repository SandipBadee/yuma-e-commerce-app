import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getAdminUserByIdAction,
  setAdminUserVerificationAction,
  updateAdminUserStatusAction,
  updateAdminUserRoleAction
} from "@/lib/actions";

export default async function AdminUserDetailsPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const userId = resolvedParams?.id;
  const errorMessage = resolvedSearchParams?.error || "";

  if (!userId) {
    return (
      <div className="space-y-4">
        <h2 className="font-title text-3xl font-bold text-stone-900">User Details</h2>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Invalid user id provided.
        </p>
        <Link href="/admin/users" className="text-sm font-medium text-red-800 underline">
          Back to users
        </Link>
      </div>
    );
  }

  const result = await getAdminUserByIdAction(userId);
  if (result.error) {
    return (
      <div className="space-y-4">
        <h2 className="font-title text-3xl font-bold text-stone-900">User Details</h2>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{result.error}</p>
        <Link href="/admin/users" className="text-sm font-medium text-red-800 underline">
          Back to users
        </Link>
      </div>
    );
  }

  const user = result.data;

  async function updateRoleAction(formData) {
    "use server";
    const role = String(formData.get("role") || "");
    if (!["ADMIN", "CUSTOMER"].includes(role)) {
      redirect(`/admin/users/${userId}?error=Invalid%20role`);
    }

    const response = await updateAdminUserRoleAction(userId, role);
    if (response.error) {
      redirect(`/admin/users/${userId}?error=${encodeURIComponent(response.error)}`);
    }

    redirect(`/admin/users/${userId}`);
  }

  async function updateVerificationAction(formData) {
    "use server";
    const isVerified = formData.get("isVerified") === "true";
    const response = await setAdminUserVerificationAction(userId, isVerified);

    if (response.error) {
      redirect(`/admin/users/${userId}?error=${encodeURIComponent(response.error)}`);
    }

    redirect(`/admin/users/${userId}`);
  }

  async function updateStatusAction(formData) {
    "use server";
    const status = String(formData.get("status") || "");
    if (!["ACTIVE", "INACTIVE", "BLOCKED", "DELETED"].includes(status)) {
      redirect(`/admin/users/${userId}?error=Invalid%20status`);
    }

    const response = await updateAdminUserStatusAction(userId, status);

    if (response.error) {
      redirect(`/admin/users/${userId}?error=${encodeURIComponent(response.error)}`);
    }

    redirect(`/admin/users/${userId}`);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-title mt-2 text-3xl font-bold text-stone-900">User Details</h2>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/users/${userId}/edit`}
            className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
          >
            Edit User
          </Link>
          <Link
            href="/admin/users"
            className="rounded-lg border border-stone-300 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200"
          >
            Back to Users
          </Link>
        </div>
      </header>

      {errorMessage && (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 break-words">
          {errorMessage}
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="font-title text-lg font-semibold text-stone-900">Profile</h3>
          <dl className="mt-3 space-y-2 text-sm text-stone-700">
            <div><dt className="font-semibold">Name</dt><dd>{user.name || "-"}</dd></div>
            <div><dt className="font-semibold">Email</dt><dd>{user.email}</dd></div>
            <div><dt className="font-semibold">Role</dt><dd>{user.role}</dd></div>
            <div><dt className="font-semibold">Status</dt><dd>{user.status || "ACTIVE"}</dd></div>
            <div><dt className="font-semibold">Verified</dt><dd>{user.isVerified ? "Yes" : "No"}</dd></div>
          </dl>
        </article>

        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="font-title text-lg font-semibold text-stone-900">Quick Actions</h3>

          <form action={updateRoleAction} className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-stone-700">Update Role</label>
            <div className="flex gap-2">
              <select
                name="role"
                defaultValue={user.role}
                className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <button type="submit" className="rounded-lg border border-amber-300 bg-amber-100 px-3 py-2 text-sm font-medium text-amber-900">
                Save
              </button>
            </div>
          </form>

          <form action={updateVerificationAction} className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-stone-700">Verification</label>
            <div className="flex gap-2">
              <select
                name="isVerified"
                defaultValue={String(user.isVerified)}
                className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>
              <button type="submit" className="rounded-lg border border-amber-300 bg-amber-100 px-3 py-2 text-sm font-medium text-amber-900">
                Save
              </button>
            </div>
          </form>

          <form action={updateStatusAction} className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-stone-700">Update Status</label>
            <div className="flex gap-2">
              <select
                name="status"
                defaultValue={user.status || "ACTIVE"}
                className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="BLOCKED">BLOCKED</option>
                <option value="DELETED">DELETED</option>
              </select>
              <button type="submit" className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100">
                Save
              </button>
            </div>
          </form>
        </article>
      </section>
    </div>
  );
}
