"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlusIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  existingUrl?: string | null;
  onChange: (file: File | null) => void;
  onRemove?: () => void;
  /** Alt text for the preview image. */
  alt?: string;
  className?: string;
}

export function ImageUploader({
  existingUrl,
  onChange,
  onRemove,
  alt = "Uploaded photo",
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  function selectFile(file: File | null) {
    if (localPreview) URL.revokeObjectURL(localPreview);
    if (file) {
      setLocalPreview(URL.createObjectURL(file));
    } else {
      setLocalPreview(null);
    }
    onChange(file);
  }

  function handleRemove() {
    selectFile(null);
    if (inputRef.current) inputRef.current.value = "";
    onRemove?.();
  }

  const preview = localPreview ?? existingUrl ?? null;

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => selectFile(e.target.files?.[0] ?? null)}
      />
      {preview ? (
        <div className="group relative overflow-hidden rounded-xl border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={alt}
            className="h-48 w-full object-cover"
          />
          <div className="absolute right-2 top-2 flex gap-2">
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              aria-label="Replace photo"
            >
              <ImagePlusIcon className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="destructive"
              onClick={handleRemove}
              aria-label="Remove photo"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) selectFile(file);
          }}
          className={cn(
            "flex h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card/40 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground",
            dragging && "border-primary bg-primary/5 text-foreground",
          )}
        >
          <ImagePlusIcon className="size-7" />
          <span className="text-sm font-medium">Add a photo</span>
          <span className="text-xs">Click or drag an image here</span>
        </button>
      )}
    </div>
  );
}
