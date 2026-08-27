"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export const SCAN_MESSAGE_KEY = "phishing_scan_message";
export const SCAN_IMAGE_KEY = "phishing_scan_image";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function ScannerForm() {
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setError(null);

    if (!file) {
      setImageFile(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported (PNG, JPG, WEBP, GIF).");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image is too large (5MB max).");
      return;
    }
    setImageFile(file);
  }

  async function handleScan() {
    const trimmed = message.trim();

    if (!trimmed && !imageFile) {
      setError("Paste a message or upload a screenshot to scan.");
      return;
    }
    if (trimmed.length > 10000) {
      setError("Message is too long (10,000 characters max).");
      return;
    }

    sessionStorage.removeItem(SCAN_MESSAGE_KEY);
    sessionStorage.removeItem(SCAN_IMAGE_KEY);

    if (trimmed) {
      sessionStorage.setItem(SCAN_MESSAGE_KEY, trimmed);
    }

    if (imageFile) {
      try {
        const dataUrl = await readFileAsDataUrl(imageFile);
        sessionStorage.setItem(SCAN_IMAGE_KEY, dataUrl);
      } catch {
        setError("Could not read the selected image. Please try another file.");
        return;
      }
    }

    router.push("/results");
  }

  return (
    <div className="mt-4 space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm text-slate-300">Paste text</span>
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setError(null);
          }}
          placeholder="Example: Your account has been suspended. Verify now to avoid permanent lockout..."
          className="h-28 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-sm leading-6 text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-400"
        />
      </label>

      {error && <p className="text-sm text-rose-300">{error}</p>}

      <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/70 p-4">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center">
          <span className="text-2xl">📷</span>
          <span className="text-sm font-medium text-white">
            {imageFile ? imageFile.name : "Upload screenshot or image"}
          </span>
          <span className="text-xs text-slate-400">
            PNG, JPG, WEBP, or GIF (5MB max)
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
        {imageFile && (
          <button
            type="button"
            onClick={() => setImageFile(null)}
            className="mt-3 text-xs text-slate-400 underline hover:text-slate-200"
          >
            Remove image
          </button>
        )}
      </div>

      <button
        onClick={handleScan}
        className="block w-full rounded-full bg-emerald-500 px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-emerald-400"
      >
        Scan for phishing
      </button>
    </div>
  );
}
