"use client";

import { useState } from "react";

interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    matinh: string;
    tentinh: string;
    loai: string;
    dientichkm2: number;
    dansonguoi: number;
    kinhdo: number;
    vido: number;
    geometry_type: string;
    geometry_coordinate_count: number;
  };
  error?: string;
}

export default function UploadProvinceButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [uploadedData, setUploadedData] = useState<
    UploadResponse["data"] | null
  >(null);

  const handleUpload = async () => {
    setIsLoading(true);
    setStatus("idle");
    setMessage("");
    setUploadedData(null);

    try {
      console.log("🚀 Starting upload...");

      const response = await fetch("/api/upload-provinces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result: UploadResponse = await response.json();

      if (result.success) {
        setStatus("success");
        setMessage(result.message);
        setUploadedData(result.data || null);
        console.log("✅ Upload successful:", result.data);
      } else {
        setStatus("error");
        setMessage(result.message || result.error || "Upload failed");
        console.error("❌ Upload failed:", result);
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Network error occurred"
      );
      console.error("❌ Upload error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={isLoading}
        className={`
          px-8 py-4 rounded-lg font-semibold text-white min-w-[250px]
          transition-all duration-200 ease-in-out shadow-lg
          ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 hover:shadow-xl"
          }
          ${status === "success" ? "bg-green-600 hover:bg-green-700" : ""}
          ${status === "error" ? "bg-red-600 hover:bg-red-700" : ""}
        `}
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Uploading...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span>Upload Province Data</span>
          </div>
        )}
      </button>

      {/* Status Message */}
      {message && (
        <div
          className={`
          p-4 rounded-lg text-sm max-w-md text-center border
          ${status === "success" ? "bg-green-50 text-green-800 border-green-200" : ""}
          ${status === "error" ? "bg-red-50 text-red-800 border-red-200" : ""}
        `}
        >
          <div className="flex items-center justify-center space-x-2">
            {status === "success" && (
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {status === "error" && (
              <svg
                className="w-5 h-5 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}

      {/* Uploaded Data Display */}
      {uploadedData && status === "success" && (
        <div className="bg-gray-50 rounded-lg p-4 w-full max-w-md">
          <h3 className="font-semibold text-gray-800 mb-3">
            Uploaded Province Info:
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tên tỉnh:</span>
              <span className="font-medium">{uploadedData.tentinh}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mã tỉnh:</span>
              <span className="font-medium">{uploadedData.matinh}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Loại:</span>
              <span className="font-medium">{uploadedData.loai}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Diện tích:</span>
              <span className="font-medium">
                {uploadedData.dientichkm2} km²
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dân số:</span>
              <span className="font-medium">
                {uploadedData.dansonguoi.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tọa độ:</span>
              <span className="font-medium">
                {uploadedData.kinhdo}, {uploadedData.vido}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Geometry:</span>
              <span className="font-medium">{uploadedData.geometry_type}</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="text-sm text-gray-600 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Đang upload dữ liệu lên MongoDB...</span>
          </div>
        </div>
      )}
    </div>
  );
}
