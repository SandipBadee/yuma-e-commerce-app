"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPasswordAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [redirectSeconds, setRedirectSeconds] = useState(null);

  useEffect(() => {
    if (status.type !== "success" || redirectSeconds === null) {
      return;
    }

    if (redirectSeconds <= 0) {
      router.push("/login");
      return;
    }

    const timer = setTimeout(() => {
      setRedirectSeconds((prev) => (prev === null ? null : prev - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [status.type, redirectSeconds, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    if (!token) {
      setStatus({ type: "error", message: "Reset token is missing." });
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setStatus({ type: "error", message: "Password must be at least 6 characters long." });
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      setLoading(false);
      return;
    }

    try {
      const result = await resetPasswordAction(token, formData.password, formData.confirmPassword);
      if (result?.message?.toLowerCase().includes("success")) {
        setStatus({ type: "success", message: result.message });
        setFormData({ password: "", confirmPassword: "" });
        setRedirectSeconds(5);
      } else {
        setRedirectSeconds(null);
        setStatus({ type: "error", message: result?.message || "Unable to reset password." });
      }
    } catch (_error) {
      setRedirectSeconds(null);
      setStatus({ type: "error", message: "Unable to reset password right now. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-6 lg:px-8">
      <div className="flex justify-center mb-6">
        <div className="relative w-full max-w-[200px] h-[120px]">
          <Image src="/logo.png" alt="YUMA Ecommerce" fill className="object-contain" priority />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-xl font-extrabold text-gray-900">Reset Password</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Enter your new password below.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10 border border-gray-100">
          {status.type !== "success" ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-black"
                />
              </div>

              {status.message && (
                <div className="p-3 rounded text-sm bg-red-50 text-red-700 border border-red-200">{status.message}</div>
              )}

              <Button type="submit" variant="primary" disabled={loading} className="w-full">
                {loading ? "Resetting password..." : "Reset Password"}
              </Button>
            </form>
          ) : (
            <div className="p-3 rounded text-sm bg-green-50 text-green-700 border border-green-200">
              {status.message}
              {redirectSeconds !== null && (
                <p className="mt-2 text-xs font-medium">
                  Redirecting to login in {redirectSeconds} second{redirectSeconds === 1 ? "" : "s"}...
                </p>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm font-medium hover:text-orange-500 transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
