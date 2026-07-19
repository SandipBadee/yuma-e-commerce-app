"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { forgotPasswordAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const result = await forgotPasswordAction(email);
      if (result?.ok) {
        setStatus({
          type: "success",
          message: result?.message || "If an account exists for this email, a reset link has been sent.",
        });
      } else {
        setStatus({
          type: "error",
          message: result?.message || "Unable to send reset email right now. Please try again later.",
        });
      }
    } catch (_error) {
      setStatus({
        type: "error",
        message: "Unable to send reset email right now. Please try again later.",
      });
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
        <h2 className="text-center text-xl font-extrabold text-gray-900">Forgot Password</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Enter your email and we will send you a reset link.</p>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-black"
              />
            </div>

            {status.message && (
              <div
                className={`p-3 rounded text-sm ${
                  status.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {status.message}
              </div>
            )}

            <Button type="submit" variant="primary" disabled={loading} className="w-full">
              {loading ? "Sending reset link..." : "Send reset link"}
            </Button>
          </form>

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
