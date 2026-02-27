"use client";

import { useState, useRef } from "react";

export default function ImageUpload({ onUpload, bucket = "guild-images", folder = "" }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = "rgba(251,191,36,0.5)";
  }

  function handleDragLeave(e) {
    e.currentTarget.style.borderColor = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = "";
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleFile(file) {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, GIF, WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setError(null);

    // Show preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    uploadFile(file);
  }

  async function uploadFile(file) {
    setUploading(true);
    setError(null);

    try {
      // Dynamic import to avoid SSR issues
      const { createClient } = await import("@/lib/supabase-browser");
      const supabase = createClient();

      const ext = file.name.split(".").pop();
      const fileName = `${folder ? folder + "/" : ""}${Date.now()}.${ext}`;

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setError("Upload failed: " + uploadError.message);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      if (onUpload) {
        onUpload(urlData.publicUrl);
      }
    } catch (err) {
      setError("Upload failed. Make sure Supabase Storage is configured.");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  }

  function clearPreview() {
    setPreview(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: "2px dashed var(--border)",
          borderRadius: "14px",
          padding: "32px",
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color 0.2s",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        {preview ? (
          <div>
            <img
              src={preview}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "200px",
                borderRadius: "10px",
                marginBottom: "12px",
              }}
            />
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              {uploading ? (
                <span style={{ fontSize: "13px", color: "var(--gold)" }}>Uploading...</span>
              ) : (
                <button
                  className="admin-btn-secondary"
                  style={{ padding: "4px 14px", fontSize: "12px" }}
                  onClick={(e) => { e.stopPropagation(); clearPreview(); }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: "36px", opacity: 0.4, marginBottom: "8px" }}>\ud83d\uddbc\ufe0f</div>
            <div style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "4px" }}>
              Drag &amp; drop an image here, or click to browse
            </div>
            <div style={{ fontSize: "12px", color: "var(--muted)", opacity: 0.7 }}>
              JPG, PNG, GIF, WebP &middot; Max 5MB
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{
          marginTop: "8px",
          padding: "8px 12px",
          borderRadius: "8px",
          background: "rgba(248,113,113,0.1)",
          border: "1px solid rgba(248,113,113,0.2)",
          color: "#f87171",
          fontSize: "13px",
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
