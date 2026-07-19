"use client";

import { useActionState } from "react";

import { createAdminUserFormAction } from "@/lib/actions";

const initialState = {
  error: "",
  success: false,
  values: {
    name: "",
    email: "",
    role: "CUSTOMER",
    isVerified: false
  }
};

export default function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createAdminUserFormAction, initialState);

  return (
    <>
      {state?.error && (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 break-words">
          {state.error}
        </section>
      )}

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <form action={formAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-1">
            <label className="mb-1 block text-sm font-medium text-stone-700">Name</label>
            <input
              type="text"
              name="name"
              required
              minLength={2}
              defaultValue={state?.values?.name || ""}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none ring-red-200 focus:ring"
              placeholder="Full name"
            />
          </div>

          <div className="md:col-span-1">
            <label className="mb-1 block text-sm font-medium text-stone-700">Email</label>
            <input
              type="email"
              name="email"
              required
              defaultValue={state?.values?.email || ""}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none ring-red-200 focus:ring"
              placeholder="user@example.com"
            />
          </div>

          <div className="md:col-span-1">
            <label className="mb-1 block text-sm font-medium text-stone-700">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none ring-red-200 focus:ring"
              placeholder="At least 6 characters"
            />
          </div>

          <div className="md:col-span-1">
            <label className="mb-1 block text-sm font-medium text-stone-700">Role</label>
            <select
              name="role"
              defaultValue={state?.values?.role || "CUSTOMER"}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none ring-red-200 focus:ring"
            >
              <option value="CUSTOMER">CUSTOMER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-stone-700 md:col-span-2">
            <input
              type="checkbox"
              name="isVerified"
              defaultChecked={Boolean(state?.values?.isVerified)}
              className="h-4 w-4 rounded border-stone-300"
            />
            Mark user as verified
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg border border-red-300 bg-red-800 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
