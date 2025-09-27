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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-10 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg border border-green-100">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src="/ggp-logo.png"
            alt="PT Great Giant Pineapple"
            className="w-20 h-20 mb-3"
          />
          <h1 className="text-2xl font-extrabold text-green-800 tracking-wide">
            Media Feedback Customer
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            PT Great Giant Pineapple
          </p>
        </div>

        {/* QR Scanner */}
        <div className="mb-6">
          <div
            id="qr-reader"
            className="w-full h-64 border-2 border-dashed border-green-300 rounded-xl flex items-center justify-center bg-green-50"
          >
            <p className="text-gray-400 text-sm">Kamera akan tampil di sini...</p>
          </div>

          <div className="flex gap-3 mt-3 justify-center">
            <button
              type="button"
              onClick={startScanner}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              Start Scanner
            </button>
            <button
              type="button"
              onClick={stopScanner}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
            >
              Stop Scanner
            </button>
          </div>

          <p className="text-sm text-center text-gray-600 mt-3">
            Status: <span className="font-semibold">{status}</span>
          </p>
        </div>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* QR Buah */}
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">
              QR Buah
            </label>
            <input
              type="text"
              value={qrValue}
              readOnly
              className="w-full border border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 p-3 rounded-lg text-gray-700 bg-gray-50"
              placeholder="Hasil scan akan muncul di sini"
            />
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">
              Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full border border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 p-3 rounded-lg text-gray-700"
              placeholder="Tulis komentar, saran, atau keluhan Anda..."
              rows={4}
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => {
                setQrValue("");
                setFeedback("");
                setStatus("");
              }}
              className="bg-red-50 hover:bg-red-100 text-red-600 font-medium px-4 py-2 rounded-lg transition"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} PT Great Giant Pineapple
        </p>
      </div>
    </div>
  );
}
