"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { createBean, updateBean, type BeanInput } from "@/lib/db";
import { uploadImage, deleteImageByPath } from "@/lib/storage";
import { beanFormSchema, type BeanFormValues } from "@/lib/schemas";
import { ROAST_LEVELS, type Bean } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/image-uploader";
import { FieldError } from "@/components/forms/field-error";

export function BeanForm({
  initial,
  onDone,
  onCancel,
}: {
  initial?: Bean;
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
    control,
    formState: { errors, isSubmitting },
  } = useForm<BeanFormValues>({
    resolver: zodResolver(beanFormSchema),
    defaultValues: {
      name: initial?.name ?? "",
      brand: initial?.brand ?? "",
      roast: initial?.roast ?? "Medium",
      origin: initial?.origin ?? "",
      tastingNotes: initial?.tastingNotes ?? "",
    },
  });

  async function onSubmit(values: BeanFormValues) {
    if (!user) return;
    try {
      let photoURL = initial?.photoURL ?? null;
      let photoPath = initial?.photoPath ?? null;

      if (file) {
        const result = await uploadImage(user.uid, "beans", file);
        if (photoPath) await deleteImageByPath(photoPath);
        photoURL = result.url;
        photoPath = result.path;
      } else if (existingUrl === null && initial?.photoPath) {
        await deleteImageByPath(initial.photoPath);
        photoURL = null;
        photoPath = null;
      }

      const input: BeanInput = {
        name: values.name,
        brand: values.brand || undefined,
        roast: values.roast,
        origin: values.origin || undefined,
        tastingNotes: values.tastingNotes || undefined,
        photoURL,
        photoPath,
      };

      const id = initial
        ? (await updateBean(user.uid, initial.id, input), initial.id)
        : await createBean(user.uid, input);

      toast.success(initial ? "Bean updated" : "Bean added");
      onDone(id);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="bean-name">Name</Label>
        <Input id="bean-name" placeholder="Ethiopia Yirgacheffe" {...register("name")} />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="bean-brand">Roaster / Brand</Label>
          <Input id="bean-brand" placeholder="Blue Tokai" {...register("brand")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bean-roast">Roast level</Label>
          <Controller
            control={control}
            name="roast"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="bean-roast" className="w-full">
                  <SelectValue placeholder="Select roast" />
                </SelectTrigger>
                <SelectContent>
                  {ROAST_LEVELS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bean-origin">Origin</Label>
        <Input id="bean-origin" placeholder="Yirgacheffe, Ethiopia" {...register("origin")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bean-notes">Tasting notes</Label>
        <Textarea
          id="bean-notes"
          rows={3}
          placeholder="Jasmine, bergamot, stone fruit…"
          {...register("tastingNotes")}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Photo</Label>
        <ImageUploader
          existingUrl={existingUrl}
          alt="Bean photo"
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
          {isSubmitting ? "Saving…" : initial ? "Save changes" : "Add bean"}
        </Button>
      </div>
    </form>
  );
}
