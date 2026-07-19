"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmailAction } from "@/lib/actions";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    let isMounted = true;

    async function verify() {
      if (!token) {
        if (!isMounted) return;
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const result = await verifyEmailAction(token);
        if (!isMounted) return;

        if (result?.message && result.message.toLowerCase().includes("verified")) {
          setStatus("success");
          setMessage(result.message);
          return;
        }

        setStatus("error");
        setMessage(result?.message || "Verification failed. Please try again.");
      } catch (_error) {
        if (!isMounted) return;
        setStatus("error");
        setMessage("Unable to verify your email right now. Please try again later.");
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="min-h-screen px-4 sm:px-6 bg-gray-50 ">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center py-10 sm:py-14">
        <div className="relative mb-5 h-[96px] w-[180px] sm:mb-6 sm:h-[120px] sm:w-[220px]">
          <Image
            src="/logo.png"
            alt="YUMA Ecommerce"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="w-full rounded-2xl border border-orange-100 bg-white/95 p-6 text-center shadow-[0_14px_40px_rgba(120,53,15,0.14)] backdrop-blur sm:p-7">
          <h1 className="text-2xl font-bold text-stone-900">Email Verification</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">{message}</p>

          {status === "loading" && (
            <div className="mt-5 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
              Please wait...
            </div>
          )}

          {status !== "loading" && (
            <div className="mt-6">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => router.push("/login")}
              >
                Go to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

