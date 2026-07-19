"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";

import AdminSignOutButton from "@/components/admin/AdminSignOutButton";

const THEME_STORAGE_KEY = "admin-theme";

export default function AdminNavbar({ user }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  const avatarLetter = useMemo(() => {
    const seed = user?.name || user?.email || "A";
    return String(seed).charAt(0).toUpperCase();
  }, [user?.email, user?.name]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(savedTheme === "dark" ? "dark" : "light");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    const root = document.getElementById("admin-theme-root");
    if (!root) return;

    root.classList.toggle("admin-dark", theme === "dark");
    root.classList.toggle("admin-light", theme !== "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme, mounted]);

  return (
    <header className="admin-navbar sticky top-0 z-20 px-5 py-3 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Admin Workspace</p>
          <p className="font-title text-lg font-semibold text-stone-900">YUMA Control Hub</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
            className="admin-btn-soft inline-flex items-center gap-1.5"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? "Light" : "Dark"}
          </button>

          <Link href="/profile" className="admin-profile-link">
            <span className="admin-avatar">{avatarLetter}</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-stone-900">
                {user?.name || "Admin User"}
              </span>
              <span className="block truncate text-xs text-stone-500">{user?.email || "admin"}</span>
            </span>
          </Link>

          <AdminSignOutButton className="admin-btn" />
        </div>
      </div>
    </header>
  );
}
