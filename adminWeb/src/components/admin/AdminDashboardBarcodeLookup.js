"use client";

import { useRef, useState } from "react";

import BarcodeScannerButton from "@/components/admin/BarcodeScannerButton";

export default function AdminDashboardBarcodeLookup({ action, errorMessage = "", initialBarcode = "" }) {
  const [barcode, setBarcode] = useState(initialBarcode);
  const formRef = useRef(null);

  function handleDetected(scannedCode) {
    const normalized = String(scannedCode || "").trim();
    if (!normalized) {
      return;
    }

    setBarcode(normalized);

    // Submit after state update so the server action can look up and redirect.
    setTimeout(() => {
      formRef.current?.requestSubmit();
    }, 0);
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
      <h3 className="font-title text-lg font-semibold text-stone-900">Quick Product Lookup</h3>
      <p className="mt-2 text-sm text-stone-600">
        Scan a product barcode to open its details page instantly.
      </p>

      <form ref={formRef} action={action} className="mt-4 space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Barcode</label>
          <input
            type="text"
            name="barcode"
            value={barcode}
            onChange={(event) => setBarcode(event.target.value)}
            placeholder="Scan or type product barcode"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <BarcodeScannerButton onDetected={handleDetected} />
          <button
            type="submit"
            className="rounded-lg border border-red-300 bg-red-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Find Product
          </button>
        </div>
      </form>

      {errorMessage && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {errorMessage}
        </p>
      )}
    </section>
  );
}
