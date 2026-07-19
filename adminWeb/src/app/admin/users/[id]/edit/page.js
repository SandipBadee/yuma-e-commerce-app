import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminUserByIdAction, updateAdminUserAction } from "@/lib/actions";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function EditAdminUserPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const userId = resolvedParams?.id;
  const errorMessage = resolvedSearchParams?.error || "";

  if (!userId) {
    return (
      <div className="space-y-4">
        <h2 className="font-title text-3xl font-bold text-stone-900">Edit User</h2>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Invalid user id provided.
        </p>
        <Link href="/admin/users" className="text-sm font-medium text-red-800 underline">
          Back to users
        </Link>
      </div>
    );
  }

  const userResult = await getAdminUserByIdAction(userId);
  if (userResult.error) {
    return (
      <div className="space-y-4">
        <h2 className="font-title text-3xl font-bold text-stone-900">Edit User</h2>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{userResult.error}</p>
        <Link href="/admin/users" className="text-sm font-medium text-red-800 underline">
          Back to users
        </Link>
      </div>
    );
  }

  const user = userResult.data;

  async function updateUserFormAction(formData) {
    "use server";

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const role = String(formData.get("role") || "CUSTOMER");
    const password = String(formData.get("password") || "");
    const isVerified = formData.get("isVerified") === "on";

    if (!name || name.length < 2) {
      redirect(`/admin/users/${userId}/edit?error=Name%20must%20be%20at%20least%202%20characters`);
    }

    if (!EMAIL_REGEX.test(email)) {
      redirect(`/admin/users/${userId}/edit?error=Invalid%20email%20format`);
    }

    if (!["ADMIN", "CUSTOMER"].includes(role)) {
      redirect(`/admin/users/${userId}/edit?error=Invalid%20role%20provided`);
    }

    if (password && password.length < 6) {
      redirect(`/admin/users/${userId}/edit?error=Password%20must%20be%20at%20least%206%20characters`);
    }

    const payload = {
      name,
      email,
      role,
      isVerified
    };

    if (password) {
      payload.password = password;
    }

    const result = await updateAdminUserAction(userId, payload);

    if (result.error) {
      redirect(`/admin/users/${userId}/edit?error=${encodeURIComponent(result.error)}`);
    }

    redirect(`/admin/users/${userId}`);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-title mt-2 text-3xl font-bold text-stone-900">Edit User</h2>
          <p className="mt-2 text-stone-600">Update user details, role, and verification status.</p>
        </div>
        <Link
          href={`/admin/users/${userId}`}
          className="rounded-lg border border-stone-300 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200"
        >
          Back to Details
        </Link>
      </header>

      {errorMessage && (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 break-words">
          {errorMessage}
        </section>
      )}

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <form action={updateUserFormAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Name</label>
            <input
              type="text"
              name="name"
              defaultValue={user.name || ""}
              required
              minLength={2}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Email</label>
            <input
              type="email"
              name="email"
              defaultValue={user.email}
              required
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Role</label>
            <select
              name="role"
              defaultValue={user.role}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            >
              <option value="CUSTOMER">CUSTOMER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">New Password (optional)</label>
            <input
              type="password"
              name="password"
              minLength={6}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              placeholder="Leave empty to keep current password"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-stone-700 md:col-span-2">
            <input
              type="checkbox"
              name="isVerified"
              defaultChecked={Boolean(user.isVerified)}
              className="h-4 w-4 rounded border-stone-300"
            />
            User is verified
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-lg border border-red-300 bg-red-800 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
