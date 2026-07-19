"use client";

import { signOut } from "next-auth/react";

export default function AdminSignOutButton({ className = "", label = "Logout" }) {
  const fallbackClassName =
    "rounded-lg border border-red-300 bg-red-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700";

  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={className || fallbackClassName}
    >
      {label}
    </button>
  );
}
