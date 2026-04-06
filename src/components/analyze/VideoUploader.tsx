"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, Film, X, FileVideo, Loader2 } from "lucide-react";

interface VideoUploaderProps {
  onVideoSelected: (file: File, preview: string) => void;
  isAnalyzing: boolean;
}

export default function VideoUploader({
  onVideoSelected,
  isAnalyzing,
}: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("video/")) return;
      const url = URL.createObjectURL(file);
      setPreview(url);
      setFileName(file.name);
      onVideoSelected(file, url);
    },
    [onVideoSelected]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function clearVideo() {
    setPreview(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (preview) {
    return (
      <div className="card relative overflow-hidden">
        {!isAnalyzing && (
          <button
            onClick={clearVideo}
            className="absolute right-3 top-3 z-10 rounded-full bg-bg/80 p-1.5 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full max-w-xs mx-auto">
            <video
              src={preview}
              className="w-full rounded-xl border border-border"
              controls
              muted
            />
            {isAnalyzing && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-bg/60 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-tiktok-pink" />
                  <p className="text-sm font-medium text-text-primary">
                    Analyzing video...
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <FileVideo className="h-4 w-4" />
            {fileName}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => fileInputRef.current?.click()}
      className={`card cursor-pointer border-2 border-dashed transition-all ${
        isDragging
          ? "border-tiktok-pink bg-tiktok-pink/5"
          : "border-border hover:border-border-bright"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center py-12">
        <div
          className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${
            isDragging ? "bg-tiktok-pink/20" : "bg-surface-2"
          }`}
        >
          {isDragging ? (
            <Film className="h-8 w-8 text-tiktok-pink" />
          ) : (
            <Upload className="h-8 w-8 text-text-muted" />
          )}
        </div>
        <p className="text-base font-semibold text-text-primary">
          {isDragging ? "Drop your video here" : "Upload a video to analyze"}
        </p>
        <p className="mt-1 text-sm text-text-muted">
          Drag & drop or click to browse. MP4, MOV, WebM supported.
        </p>
      </div>
    </div>
  );
}
