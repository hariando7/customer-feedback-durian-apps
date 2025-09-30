"use client";

import React, { useEffect, useRef, useState } from "react";

export default function FeedbackForm() {
  const [qrValue, setQrValue] = useState("");
  const [feedback, setFeedback] = useState("");
  const [texture, setTexture] = useState("");
  const [rasa, setRasa] = useState("");
  const [warna, setWarna] = useState("");
  const [afterTester, setAfterTester] = useState("");
  const [status, setStatus] = useState("");
  const [showScanner, setShowScanner] = useState(true);
  const [loading, setLoading] = useState(false);

  const html5QrCodeRef = useRef<any>(null);
  const isScanningRef = useRef(false);

  // Mulai scanner
  const startScanner = async () => {
    setStatus("Memulai scanner...");
    setLoading(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const qrRegionId = "qr-reader";

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(qrRegionId);
      }

      const cameras = await Html5Qrcode.getCameras();
      let backCameraId: string | null = null;

      if (cameras && cameras.length > 0) {
        const backCamera = cameras.find((cam) =>
          cam.label.toLowerCase().includes("back") ||
          cam.label.toLowerCase().includes("rear") ||
          cam.label.toLowerCase().includes("environment")
        );
        backCameraId = backCamera ? backCamera.id : cameras[0].id;
      }

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      const handleSuccess = (decodedText: string) => {
        setQrValue(decodedText);
        setStatus("QR terdeteksi!");
        setShowScanner(false);
        stopScanner();
        alert("QR berhasil terbaca!");
      };

      if (backCameraId) {
        await html5QrCodeRef.current.start(
          backCameraId,
          config,
          handleSuccess,
          () => {}
        );
      } else {
        await html5QrCodeRef.current.start(
          { facingMode: "environment" },
          config,
          handleSuccess
        );
      }

      isScanningRef.current = true;
      setStatus("Scanning...");
    } catch (err: any) {
      console.error(err);
      alert("Gagal memulai scanner. Pastikan kamera diizinkan.");
      setStatus("Gagal memulai scanner: " + (err?.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  // Hentikan scanner
  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScanningRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error("Error stop scanner:", err);
      } finally {
        isScanningRef.current = false;
        setStatus((s) => (qrValue ? "QR ditemukan" : "Scanner berhenti"));
      }
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            try {
              html5QrCodeRef.current.clear();
            } catch (_) {}
          });
      }
    };
  }, []);

  // Submit ke Apps Script
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Mengirim...");
    setLoading(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qr_buah: qrValue,
          feedback,
          texture,
          rasa,
          warna,
          afterTester,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("Terima kasih atas feedback Anda!");
        alert("Feedback berhasil dikirim. Terima kasih atas partisipasi Anda!");
        setQrValue("");
        setFeedback("");
        setTexture("");
        setRasa("");
        setWarna("");
        setAfterTester("");
        setShowScanner(true);
      } else {
        setStatus("Gagal menyimpan: " + (data.message || "Tidak diketahui"));
        alert("Gagal menyimpan feedback. Silakan coba lagi.");
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setStatus("Error: " + (err.message ?? "Terjadi kesalahan"));
      alert("Terjadi kesalahan jaringan. Mohon coba lagi nanti.");
    } finally {
      setLoading(false);
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
        {showScanner && (
          <div className="mb-6">
            <div
              id="qr-reader"
              className="w-full h-64 border-2 border-dashed border-green-300 rounded-xl flex items-center justify-center bg-green-50"
            >
              <p className="text-gray-400 text-sm">
                Kamera akan tampil di sini...
              </p>
            </div>

            <div className="flex gap-3 mt-3 justify-center">
              <button
                type="button"
                onClick={startScanner}
                disabled={loading}
                className={`${
                  loading
                    ? "bg-green-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-white px-4 py-2 rounded-lg font-medium transition`}
              >
                {loading ? "Memuat..." : "Start Scanner"}
              </button>
              <button
                type="button"
                onClick={stopScanner}
                disabled={loading}
                className={`${
                  loading
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-gray-200"
                } text-gray-800 px-4 py-2 rounded-lg font-medium transition`}
              >
                Stop Scanner
              </button>
            </div>

            <p className="text-sm text-center text-gray-600 mt-3">
              Status: <span className="font-semibold">{status}</span>
            </p>
          </div>
        )}

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">
              Texsture
            </label>
            <textarea
              value={texture}
              onChange={(e) => setTexture(e.target.value)}
              className="w-full border border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 p-3 rounded-lg text-gray-700"
              placeholder="Tulis komentar anda mengenai Texsture Buah"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">
              Rasa
            </label>
            <textarea
              value={rasa}
              onChange={(e) => setRasa(e.target.value)}
              className="w-full border border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 p-3 rounded-lg text-gray-700"
              placeholder="Tulis komentar anda mengenai Rasa Buah"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">
              Warna
            </label>
            <textarea
              value={warna}
              onChange={(e) => setWarna(e.target.value)}
              className="w-full border border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 p-3 rounded-lg text-gray-700"
              placeholder="Tulis komentar anda mengenai Warna Buah"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">
              After tester
            </label>
            <textarea
              value={afterTester}
              onChange={(e) => setAfterTester(e.target.value)}
              className="w-full border border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 p-3 rounded-lg text-gray-700"
              placeholder="Tulis komentar anda mengenai After tester Buah"
              rows={4}
              required
            />
          </div>

          <div className="flex justify-between">
            <button
              type="submit"
              disabled={loading}
              className={`${
                loading
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } text-white font-semibold px-6 py-2 rounded-lg transition`}
            >
              {loading ? "Mengirim..." : "Submit"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setQrValue("");
                setFeedback("");
                setStatus("");
                setShowScanner(true);
                alert("Form telah direset.");
              }}
              className={`${
                loading
                  ? "bg-red-100 cursor-not-allowed"
                  : "bg-red-50 hover:bg-red-100"
              } text-red-600 font-medium px-4 py-2 rounded-lg transition`}
            >
              Reset
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} PT Great Giant Pineapple
        </p>
      </div>
    </div>
  );
}
