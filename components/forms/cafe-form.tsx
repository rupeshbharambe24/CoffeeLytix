"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { createCafe, updateCafe, type CafeInput } from "@/lib/db";
import { uploadImage, deleteImageByPath } from "@/lib/storage";
import { cafeFormSchema, type CafeFormValues } from "@/lib/schemas";
import type { Cafe } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/image-uploader";
import { FieldError } from "@/components/forms/field-error";

export function CafeForm({
  initial,
  onDone,
  onCancel,
}: {
  initial?: Cafe;
  onDone: (id: string) => void;
  onCancel?: () => void;
}) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [existingUrl, setExistingUrl] = useState<string | null>(
    initial?.photoURL ?? null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CafeFormValues>({
    resolver: zodResolver(cafeFormSchema),
    defaultValues: {
      name: initial?.name ?? "",
      address: initial?.address ?? "",
      notes: initial?.notes ?? "",
    },
  });

  async function onSubmit(values: CafeFormValues) {
    if (!user) return;
    try {
      let photoURL = initial?.photoURL ?? null;
      let photoPath = initial?.photoPath ?? null;

      if (file) {
        const result = await uploadImage(user.uid, "cafes", file);
        if (photoPath) await deleteImageByPath(photoPath);
        photoURL = result.url;
        photoPath = result.path;
      } else if (existingUrl === null && initial?.photoPath) {
        await deleteImageByPath(initial.photoPath);
        photoURL = null;
        photoPath = null;
      }

      const input: CafeInput = {
        name: values.name,
        address: values.address || undefined,
        notes: values.notes || undefined,
        photoURL,
        photoPath,
      };

      const id = initial
        ? (await updateCafe(user.uid, initial.id, input), initial.id)
        : await createCafe(user.uid, input);

      toast.success(initial ? "Café updated" : "Café added");
      onDone(id);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="cafe-name">Name</Label>
        <Input id="cafe-name" placeholder="Third Wave Coffee" {...register("name")} />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cafe-address">Location</Label>
        <Input id="cafe-address" placeholder="Indiranagar, Bangalore" {...register("address")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cafe-notes">Notes</Label>
        <Textarea
          id="cafe-notes"
          rows={3}
          placeholder="Great ambience, friendly baristas…"
          {...register("notes")}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Photo</Label>
        <ImageUploader
          existingUrl={existingUrl}
          alt="Café photo"
          onChange={setFile}
          onRemove={() => setExistingUrl(null)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : initial ? "Save changes" : "Add café"}
        </Button>
      </div>
    </form>
  );
}
