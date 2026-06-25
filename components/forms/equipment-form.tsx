"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  createEquipment,
  updateEquipment,
  type EquipmentInput,
} from "@/lib/db";
import { compressImageToDataUrl } from "@/lib/image";
import { equipmentFormSchema, type EquipmentFormValues } from "@/lib/schemas";
import { EQUIPMENT_TYPES, type Equipment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/image-uploader";
import { RatingSlider } from "@/components/rating-slider";
import { FieldError } from "@/components/forms/field-error";

export function EquipmentForm({
  initial,
  onDone,
  onCancel,
}: {
  initial?: Equipment;
  onDone: (id: string) => void;
  onCancel?: () => void;
}) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [existingUrl, setExistingUrl] = useState<string | null>(
    initial?.photoURL ?? null,
  );
  const [rated, setRated] = useState<boolean>(
    typeof initial?.rating === "number",
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      name: initial?.name ?? "",
      type: initial?.type ?? "Other",
      notes: initial?.notes ?? "",
      rating: initial?.rating ?? 7,
    },
  });

  async function onSubmit(values: EquipmentFormValues) {
    if (!user) return;
    try {
      let photoURL = initial?.photoURL ?? null;
      if (file) {
        photoURL = await compressImageToDataUrl(file);
      } else if (existingUrl === null) {
        photoURL = null;
      }

      const input: EquipmentInput = {
        name: values.name,
        type: values.type,
        notes: values.notes || undefined,
        rating: rated ? (values.rating ?? null) : null,
        photoURL,
      };

      const id = initial
        ? (await updateEquipment(user.uid, initial.id, input), initial.id)
        : await createEquipment(user.uid, input);

      toast.success(initial ? "Equipment updated" : "Equipment added");
      onDone(id);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="eq-name">Name</Label>
        <Input id="eq-name" placeholder="Hario V60" {...register("name")} />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="eq-type">Type</Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="eq-type" className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="eq-rated" className="cursor-pointer">
            Rate this gear
          </Label>
          <Switch id="eq-rated" checked={rated} onCheckedChange={setRated} />
        </div>
        {rated && (
          <div className="mt-3">
            <Controller
              control={control}
              name="rating"
              render={({ field }) => (
                <RatingSlider
                  id="eq-rating"
                  label="Rating"
                  value={field.value ?? 7}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="eq-notes">Notes</Label>
        <Textarea
          id="eq-notes"
          rows={2}
          placeholder="Ceramic, size 02…"
          {...register("notes")}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Photo</Label>
        <ImageUploader
          existingUrl={existingUrl}
          alt="Equipment photo"
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
          {isSubmitting ? "Saving…" : initial ? "Save changes" : "Add equipment"}
        </Button>
      </div>
    </form>
  );
}
