/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

function HomePage({ className }: { className?: string }) {
  /*
  Parameters : 
  Color: from whitish to golden yellow
  Aroma: weak to strong
  Texture Creamy
  Texture Smooth
  Sweet
  Bitter
  Alcohol
  */
  const [qrValue, setQrValue] = useState("");
  const [feedback, setFeedback] = useState("");
  const [color, setColor] = useState("");
  const [aroma, setAroma] = useState("");
  const [textureCreamy, setTextureCreamy] = useState("");
  const [textureSmooth, setTextureSmooth] = useState("");
  const [sweet, setSweet] = useState("");
  const [bitter, setBitter] = useState("");
  const [alcohol, setAlcohol] = useState("");
  const [status, setStatus] = useState("");
  const [showScanner, setShowScanner] = useState(true);
  const [loading, setLoading] = useState(false);

  const html5QrCodeRef = useRef<any>(null);
  const isScanningRef = useRef(false);

  const isFormValid =
    color !== "" &&
    aroma !== "" &&
    textureCreamy !== "" &&
    textureSmooth !== "" &&
    sweet !== "" &&
    bitter !== "" &&
    alcohol !== "" 
    //qrValue !== ""; // opsional kalau QR wajib juga

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
          () => { }
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
          .catch(() => { })
          .finally(() => {
            try {
              html5QrCodeRef.current.clear();
            } catch (_) { }
          });
      }
    };
  }, []);

  // Submit ke Apps Script
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Mengirim...");
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qr_buah: qrValue,
          feedback,
          color,
          aroma,
          textureCreamy,
          textureSmooth,
          sweet,
          bitter,
          alcohol,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("Terima kasih atas feedback Anda!");
        alert("Feedback berhasil dikirim. Terima kasih atas partisipasi Anda!");
        setQrValue("");
        setFeedback("");
        setColor("");
        setAroma("");
        setTextureCreamy("");
        setTextureSmooth("");
        setSweet("");
        setBitter("");
        setAlcohol("");
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
    <>
      {loading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 min-h-full">
          <div className="flex flex-col items-center gap-3">
            {/* Spinner */}
            <svg
              className="animate-spin h-10 w-10 text-[#E7C952]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>

            {/* Text */}
            <p className="text-white text-sm font-medium animate-pulse">
              Mengirim data...
            </p>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gradient-to-b from-[#D4B63F] to-[#E7C952] flex items-center justify-center py-10 px-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg border border-[#E7C952]">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <Image
              src="/assets/images/DurianApps.jpg"
              alt="Great Giant Foods"
              width={180}
              height={180}
              className="transition-transform hover:scale-105 rounded-full"
            />

            <h1 className="text-2xl font-extrabold text-[#D4B63F] tracking-wide">
              Customer Feedback Durian
            </h1>
            <p className="text-gray-500 text-sm md:text-lg mt-1">
              Great Giant Foods
            </p>
          </div>

          {/* QR Scanner */}
          {showScanner && (
            <div className="mb-6">
              <div
                id="qr-reader"
                className="w-full h-64 border-2 border-dashed border-[#E7C952] rounded-xl flex items-center justify-center bg-[#E7C952]/20"
              >
                <p className="text-gray-400 text-sm md:text-lg">
                  Kamera akan tampil di sini...
                </p>
              </div>

              <div className="flex gap-3 mt-3 justify-center">
                <button
                  type="button"
                  onClick={startScanner}
                  disabled={loading}
                  className={`${loading
                    ? "bg-[#E7C952] cursor-not-allowed"
                    : "bg-[#E7C952] hover:bg-[#E7C952]/70"
                    } text-white px-4 py-2 rounded-lg font-medium transition`}
                >
                  {loading ? "Memuat..." : "Start Scanner"}
                </button>
                <button
                  type="button"
                  onClick={stopScanner}
                  disabled={loading}
                  className={`${loading
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
          <div className="block text-sm md:text-lg font-medium text-black mb-4 mt-4 text-justify">
            <span className="text-red-500">*Keterangan:</span> Panelis diminta melakukan analisis sensori berdasarkan intensitas setiap parameter yang diamati, mulai dari yang paling lemah hingga yang paling kuat. Penilaian dilakukan dengan memberikan skor pada rentang 0 hingga 7, di mana semakin tinggi skor menunjukkan intensitas yang semakin kuat.
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm md:text-lg font-medium text-[#E7C952] mb-1">
                QR Buah
              </label>
              <input
                type="text"
                value={qrValue}
                readOnly
                className="w-full border border-[#E7C952] focus:border-[#E7C952] focus:ring-2 focus:ring-[#E7C952] p-3 rounded-full text-gray-700 bg-gray-50"
                placeholder="Hasil scan akan muncul di sini"
                required
              />
            </div>

            <div className="m-0">
              <div>
                <label className="block text-sm md:text-lg font-medium text-[#E7C952] mb-1">
                  Color: from whitish to golden yellow
                </label>
                <div className="flex justify-between gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <label
                      key={num}
                      className={`flex flex-col items-center cursor-pointer transition-all duration-200
                ${color !== "" && Number(color) === num
                          ? "text-white bg-[#E7C952] shadow-md scale-105"
                          : "text-gray-700 bg-[#E7C952]/10 hover:bg-[#E7C952]/70"
                        }
                rounded-full p-3 w-10 text-center`}
                    >
                      <input
                        type="radio"
                        name="color"
                        value={num}
                        checked={color !== "" && Number(color) === num}
                        onChange={() => setColor(String(num))}
                        className="hidden"
                        required
                      />
                      <span className="font-semibold">{num}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Garis Pemisah */}
              <hr className="border-t border-[#E7C952]/30 my-2" />
              <div>
                <label className="block text-sm md:text-lg font-medium text-[#E7C952] mb-1">
                  Aroma: weak to strong
                </label>
                <div className="flex justify-between gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <label
                      key={num}
                      className={`flex flex-col items-center cursor-pointer transition-all duration-200
              ${aroma !== "" && Number(aroma) === num
                          ? "text-white bg-[#E7C952] shadow-md scale-105"
                          : "text-gray-700 bg-[#E7C952]/10 hover:bg-[#E7C952]/70"
                        }
              rounded-full p-3 w-10 text-center`}
                    >
                      <input
                        type="radio"
                        name="aroma"
                        value={num}
                        checked={aroma !== "" && Number(aroma) === num}
                        onChange={() => setAroma(String(num))}
                        className="hidden"
                        required
                      />
                      <span className="font-semibold">{num}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Garis Pemisah */}
              <hr className="border-t border-[#E7C952]/30 my-2" />
              <div>
                <label className="block text-sm md:text-lg font-medium text-[#E7C952] mb-1">
                  Texture Creamy
                </label>
                <div className="flex justify-between gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <label
                      key={num}
                      className={`flex flex-col items-center cursor-pointer transition-all duration-200
          ${textureCreamy !== "" && Number(textureCreamy) === num
                          ? "text-white bg-[#E7C952] shadow-md scale-105"
                          : "text-gray-700 bg-[#E7C952]/10 hover:bg-[#E7C952]/70"
                        }
          rounded-full p-3 w-10 text-center`}
                    >
                      <input
                        type="radio"
                        name="textureCreamy"
                        value={num}
                        checked={textureCreamy !== "" && Number(textureCreamy) === num}
                        onChange={() => setTextureCreamy(String(num))}
                        className="hidden"
                        required
                      />
                      <span className="font-semibold">{num}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Garis Pemisah */}
              <hr className="border-t border-[#E7C952]/30 my-2" />
              <div>
                <label className="block text-sm md:text-lg font-medium text-[#E7C952] mb-1">
                  Texture Smooth
                </label>
                <div className="flex justify-between gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <label
                      key={num}
                      className={`flex flex-col items-center cursor-pointer transition-all duration-200
          ${textureSmooth !== "" && Number(textureSmooth) === num
                          ? "text-white bg-[#E7C952] shadow-md scale-105"
                          : "text-gray-700 bg-[#E7C952]/10 hover:bg-[#E7C952]/70"
                        }
          rounded-full p-3 w-10 text-center`}
                    >
                      <input
                        type="radio"
                        name="textureSmooth"
                        value={num}
                        checked={textureSmooth !== "" && Number(textureSmooth) === num}
                        onChange={() => setTextureSmooth(String(num))}
                        className="hidden"
                        required
                      />
                      <span className="font-semibold">{num}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Garis Pemisah */}
              <hr className="border-t border-[#E7C952]/30 my-2" />
              <div>
                <label className="block text-sm md:text-lg font-medium text-[#E7C952] mb-1">
                  Sweet
                </label>
                <div className="flex justify-between gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <label
                      key={num}
                      className={`flex flex-col items-center cursor-pointer transition-all duration-200
          ${sweet !== "" && Number(sweet) === num
                          ? "text-white bg-[#E7C952] shadow-md scale-105"
                          : "text-gray-700 bg-[#E7C952]/10 hover:bg-[#E7C952]/70"
                        }
          rounded-full p-3 w-10 text-center`}
                    >
                      <input
                        type="radio"
                        name="sweet"
                        value={num}
                        checked={sweet !== "" && Number(sweet) === num}
                        onChange={() => setSweet(String(num))}
                        className="hidden"
                        required
                      />
                      <span className="font-semibold">{num}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Garis Pemisah */}
              <hr className="border-t border-[#E7C952]/30 my-2" />
              <div>
                <label className="block text-sm md:text-lg font-medium text-[#E7C952] mb-1">
                  Bitter
                </label>
                <div className="flex justify-between gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <label
                      key={num}
                      className={`flex flex-col items-center cursor-pointer transition-all duration-200
          ${bitter !== "" && Number(bitter) === num
                          ? "text-white bg-[#E7C952] shadow-md scale-105"
                          : "text-gray-700 bg-[#E7C952]/10 hover:bg-[#E7C952]/70"
                        }
          rounded-full p-3 w-10 text-center`}
                    >
                      <input
                        type="radio"
                        name="bitter"
                        value={num}
                        checked={bitter !== "" && Number(bitter) === num}
                        onChange={() => setBitter(String(num))}
                        className="hidden"
                        required
                      />
                      <span className="font-semibold">{num}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Garis Pemisah */}
              <hr className="border-t border-[#E7C952]/30 my-2" />
              <div>
                <label className="block text-sm md:text-lg font-medium text-[#E7C952] mb-1">
                  Alcohol
                </label>
                <div className="flex justify-between gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <label
                      key={num}
                      className={`flex flex-col items-center cursor-pointer transition-all duration-200
          ${alcohol !== "" && Number(alcohol) === num
                          ? "text-white bg-[#E7C952] shadow-md scale-105"
                          : "text-gray-700 bg-[#E7C952]/10 hover:bg-[#E7C952]/70"
                        }
          rounded-full p-3 w-10 text-center`}
                    >
                      <input
                        type="radio"
                        name="alcohol"
                        value={num}
                        checked={alcohol !== "" && Number(alcohol) === num}
                        onChange={() => setAlcohol(String(num))}
                        className="hidden"
                        required
                      />
                      <span className="font-semibold">{num}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Garis Pemisah */}
              <hr className="border-t border-[#E7C952]/30 my-2" />
              <div>
                <label className="block text-sm md:text-lg font-medium text-[#E7C952] mb-1">
                  Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full border border-[#E7C952] focus:border-[#E7C952] focus:ring-2 focus:ring-[#E7C952] p-3 rounded-lg text-gray-700"
                  placeholder="Tulis komentar, saran, atau keluhan Anda..."
                  rows={4}
                  required
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className={`${loading
                  ? "bg-[#E7C952] cursor-not-allowed"
                  : "bg-[#E7C952] hover:bg-[#E7C952]/70"
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
                className={`${loading
                  ? "bg-red-100 cursor-not-allowed"
                  : "bg-red-50 hover:bg-red-100"
                  } text-red-600 font-medium px-4 py-2 rounded-lg transition`}
              >
                Reset
              </button>
            </div>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            © {new Date().getFullYear()} Great Giant Foods
          </p>
        </div>
      </div>
    </>
  );
}

export default HomePage;
