"use client";

import React, { useEffect, useRef, useState } from "react";

export default function FeedbackForm() {
  const [qrValue, setQrValue] = useState("");
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("");
  // Use type assertion to allow assignment of Html5Qrcode instance
  const html5QrCodeRef = useRef<any>(null);
  const isScanningRef = useRef(false);

  // Start scanner (lazy import html5-qrcode to avoid SSR issues)
  const startScanner = async () => {
    setStatus("Memulai scanner...");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const qrRegionId = "qr-reader";

      // jika instance belum ada → buat
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(qrRegionId);
      }

      // coba dapatkan kamera perangkat
      const cameras = await Html5Qrcode.getCameras();
      const cameraId = cameras && cameras.length ? cameras[0].id : null;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      if (cameraId) {
        await html5QrCodeRef.current.start(
          cameraId,
          config,
          (decodedText: string) => {
            setQrValue(decodedText);
            setStatus("QR terdeteksi!");
            // hentikan scanner setelah membaca 1x (opsional)
            stopScanner();
          },
          (errorMessage: string) => {
            // error per frame (bisa diabaikan)
            // console.debug("scan error", errorMessage);
          }
        );
      } else {
        // fallback menggunakan facingMode
        await html5QrCodeRef.current.start(
          { facingMode: { exact: "environment" } },
          config,
          (decodedText: string) => {
            setQrValue(decodedText);
            setStatus("QR terdeteksi!");
            stopScanner();
          }
        );
      }

      isScanningRef.current = true;
      setStatus("Scanning...");
    } catch (err: any) {
      console.error(err);
      setStatus("Gagal memulai scanner: " + (err?.message ?? err));
    }
  };

  // Stop scanner
  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScanningRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        // clear UI
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error("Error stop scanner:", err);
      } finally {
        isScanningRef.current = false;
        setStatus((s) => (qrValue ? "QR ditemukan" : "Scanner berhenti"));
      }
    }
  };

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .catch(() => { })
          .finally(() => {
            try {
              html5QrCodeRef.current.clear();
            } catch (_) { }
          });
      }
    };
  }, []);

  // Submit ke Google Apps Script (ganti URL)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Mengirim...");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qr_buah: qrValue,
          feedback,
        }),
      });

      const data = await res.json();
      console.log("Response:", data); // <— Tambahkan ini untuk debug

      if (data.success) {
        setStatus("Terima kasih atas feedback Anda!");
        setQrValue("");
        setFeedback("");
      } else {
        setStatus("Gagal menyimpan: " + (data.message || "Tidak diketahui"));
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setStatus("Error: " + (err.message ?? "Terjadi kesalahan"));
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Media Feedback Customer</h1>

      <div className="mb-3">
        <div id="qr-reader" style={{ width: "100%", height: 300, borderRadius: 8, overflow: "hidden", border: "1px solid #e5e7eb" }} />
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={startScanner}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Start Scanner
          </button>
          <button
            type="button"
            onClick={stopScanner}
            className="bg-gray-200 text-black px-3 py-1 rounded"
          >
            Stop Scanner
          </button>
        </div>
        <p className="text-sm mt-2">Status: {status}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 mt-4">
        <div>
          <label className="block text-sm mb-1">QR Buah:</label>
          <input
            type="text"
            value={qrValue}
            readOnly
            className="border p-2 w-full rounded"
            placeholder="Hasil scan akan muncul di sini"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Feedback:</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="border p-2 w-full rounded"
            required
            placeholder="Tulis komentar atau saran..."
            rows={4}
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            Submit
          </button>
          <button
            type="button"
            onClick={() => { setQrValue(""); setFeedback(""); setStatus(""); }}
            className="bg-red-100 text-red-700 px-3 py-2 rounded"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
