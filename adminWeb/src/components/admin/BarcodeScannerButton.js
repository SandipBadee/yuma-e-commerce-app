"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScannerButton({ onDetected, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");

  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const streamRef = useRef(null);

  const reader = useMemo(() => new BrowserMultiFormatReader(), []);

  async function handleOpenScanner() {
    setErrorMessage("");

    if (typeof window !== "undefined" && !window.isSecureContext) {
      setErrorMessage("Camera access needs a secure context. Use https or open the app on localhost.");
      setIsOpen(true);
      return;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      setErrorMessage("This browser does not support camera access via getUserMedia.");
      setIsOpen(true);
      return;
    }

    try {
      // Trigger browser permission prompt from user gesture before scanner starts.
      const accessStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      accessStream.getTracks().forEach((track) => track.stop());
      setIsOpen(true);
    } catch (error) {
      const errorName = String(error?.name || "");
      if (errorName === "NotAllowedError") {
        setErrorMessage("Camera access was denied. Allow camera for this site and try again.");
      } else if (errorName === "NotFoundError") {
        setErrorMessage("No camera device was found.");
      } else if (errorName === "NotReadableError") {
        setErrorMessage("Camera is busy in another app. Close it there and retry.");
      } else {
        setErrorMessage("Unable to request camera access. Check browser permissions and retry.");
      }
      setIsOpen(true);
    }
  }

  function stopScanner() {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      BrowserMultiFormatReader.cleanVideoSource(videoRef.current);
    }
  }

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setIsScanning(false);
      return;
    }

    let isCancelled = false;

    async function setupCamera() {
      try {
        setErrorMessage("");
        const videoDevices = await BrowserMultiFormatReader.listVideoInputDevices();

        if (isCancelled) return;

        if (!videoDevices || videoDevices.length === 0) {
          setErrorMessage("No camera found on this device.");
          return;
        }

        setDevices(videoDevices);
        const initialDeviceId = selectedDeviceId || videoDevices[0].deviceId;
        setSelectedDeviceId(initialDeviceId);
      } catch (_error) {
        if (!isCancelled) {
          setErrorMessage("Unable to access camera devices. Check browser permissions.");
        }
      }
    }

    setupCamera();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, selectedDeviceId, reader]);

  useEffect(() => {
    if (!isOpen || !selectedDeviceId || !videoRef.current) {
      return;
    }

    let isCancelled = false;

    async function startScanner() {
      try {
        setIsScanning(true);
        setErrorMessage("");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId } }
            : { facingMode: "environment" },
          audio: false
        });

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const controls = await reader.decodeFromStream(stream, videoRef.current, (result, err) => {
          if (result) {
            const text = String(result.getText() || "").trim();
            if (text) {
              onDetected(text);
              setIsOpen(false);
            }
            return;
          }

          if (err && err.name !== "NotFoundException") {
            setErrorMessage("Scanner error. Try changing camera or enter code manually.");
          }
        });

        if (isCancelled) {
          controls.stop();
          return;
        }

        controlsRef.current = controls;
      } catch (_error) {
        if (!isCancelled) {
          setErrorMessage("Could not start barcode scanner. Check camera permissions.");
        }
      } finally {
        if (!isCancelled) {
          setIsScanning(false);
        }
      }
    }

    startScanner();

    return () => {
      isCancelled = true;
      stopScanner();
    };
  }, [isOpen, selectedDeviceId, onDetected, reader]);

  return (
    <>
      <button
        type="button"
        onClick={handleOpenScanner}
        disabled={disabled}
        className="rounded-lg border border-stone-300 bg-stone-100 px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Scan Barcode
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-stone-900">Scan Product Barcode</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-stone-300 px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-600">Camera</label>
                <select
                  value={selectedDeviceId}
                  onChange={(event) => setSelectedDeviceId(event.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                >
                  {devices.map((device, index) => (
                    <option key={`${device.deviceId || "unknown-device"}-${index}`} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId.slice(0, 6)}`}
                    </option>
                  ))}
                </select>
              </div>

              <video
                ref={videoRef}
                className="h-64 w-full rounded-xl bg-black object-cover"
                muted
                autoPlay
                playsInline
              />

              <p className="text-xs text-stone-600">
                Point the camera at a barcode (EAN/UPC/Code128). The field fills automatically after detection.
              </p>

              {isScanning && <p className="text-xs text-stone-500">Starting scanner...</p>}

              {errorMessage && <p className="text-xs text-red-700">{errorMessage}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
