"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { resendVerificationAction } from "@/lib/actions";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const handledUnauthorizedSession = useRef(false);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const showResend = status.type === "error" && status.message === "Please verify your email first";

  useEffect(() => {
    if (authStatus !== "authenticated") {
      handledUnauthorizedSession.current = false;
      return;
    }

    const role = session?.user?.role;

    if (role === "ADMIN") {
      router.replace("/admin");
      return;
    }

    // Wait for session hydration; role can be temporarily undefined right after login.
    if (!role) {
      return;
    }

    if (!handledUnauthorizedSession.current) {
      handledUnauthorizedSession.current = true;
      setStatus({ type: "error", message: "Only admin accounts can access this panel." });
      signOut({ redirect: false });
    }
  }, [authStatus, session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    setResendMessage("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setStatus({
          type: "error",
          message: result.error || "Invalid email or password",
        });
      } else {
        setStatus({ type: "success", message: "Login successful! Redirecting..." });
      }
    } catch (_error) {
      setStatus({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      setResendMessage("Enter your email address first.");
      return;
    }

    setResendLoading(true);
    setResendMessage("");

    try {
      const result = await resendVerificationAction(formData.email);
      if (result?.message?.toLowerCase().includes("new link sent")) {
        setResendMessage("New link sent! Check your inbox (and spam folder)");
      } else {
        setResendMessage(result?.message || "Unable to resend verification email.");
      }
    } catch (_error) {
      setResendMessage("Unable to resend verification email right now.");
    } finally {
      setResendLoading(false);
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
        <h2 className="text-center text-xl font-extrabold text-gray-900">Admin Sign in</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-black"
              />
              <div className="mt-2 text-right">
                <Link href="/forgot-password" className="text-xs font-medium text-red-800 hover:text-red-900">
                  Forgot password?
                </Link>
              </div>
            </div>

            {status.message && (
              <div
                className={`p-3 rounded text-sm animate-in fade-in duration-300 ${
                  status.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {status.message}
                {showResend && (
                  <div className="mt-2 text-sm">
                    Didn&apos;t get the link?{" "}
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      className="font-semibold underline underline-offset-2 disabled:opacity-60"
                    >
                      {resendLoading ? "Sending..." : "Resend Email"}
                    </button>
                  </div>
                )}
                {resendMessage && (
                  <div
                    className={`mt-2 text-xs ${
                      resendMessage.toLowerCase().includes("new link sent") ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {resendMessage}
                  </div>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || authStatus === "loading"}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
