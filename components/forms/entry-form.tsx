"use client";

import { useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createEntry, updateEntry, type EntryInput } from "@/lib/db";
import { compressImageToDataUrl } from "@/lib/image";
import { useBeans, useCafes, useEquipment } from "@/lib/hooks";
import { entryFormSchema, type EntryFormValues } from "@/lib/schemas";
import {
  BREW_TYPES,
  RATING_ATTRIBUTES,
  RATING_LABELS,
  SUGGESTED_TAGS,
  type Entry,
} from "@/lib/types";
import { toDateInputValue, fromDateInputValue } from "@/lib/format";
import { cn } from "@/lib/utils";
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
import { RatingSlider } from "@/components/rating-slider";
import { TagInput } from "@/components/tag-input";
import { ImageUploader } from "@/components/image-uploader";
import { FieldError } from "@/components/forms/field-error";
import { BeanDialog } from "@/components/forms/bean-dialog";
import { CafeDialog } from "@/components/forms/cafe-dialog";

const NONE = "__none__";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h2>
  );
}

export function EntryForm({
  initial,
  onDone,
  onCancel,
}: {
  initial?: Entry;
  onDone: (id: string) => void;
  onCancel?: () => void;
}) {
  const { user } = useAuth();
  const { data: cafes } = useCafes();
  const { data: beans } = useBeans();
  const { data: equipment } = useEquipment();

  const [file, setFile] = useState<File | null>(null);
  const [existingUrl, setExistingUrl] = useState<string | null>(
    initial?.photoURL ?? null,
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: {
      date: initial ? toDateInputValue(initial.date) : toDateInputValue(new Date()),
      coffeeName: initial?.coffeeName ?? "",
      cafeId: initial?.cafeId ?? null,
      beanId: initial?.beanId ?? null,
      equipmentIds: initial?.equipmentIds ?? [],
      brewType: initial?.brewType ?? "Espresso",
      milk: initial?.milk ?? false,
      milkType: initial?.milkType ?? "",
      aroma: initial?.ratings.aroma ?? 7,
      flavor: initial?.ratings.flavor ?? 7,
      aftertaste: initial?.ratings.aftertaste ?? 7,
      acidity: initial?.ratings.acidity ?? 6,
      body: initial?.ratings.body ?? 7,
      overallRating: initial?.overallRating ?? 7,
      tags: initial?.tags ?? [],
      notes: initial?.notes ?? "",
    },
  });

  const milk = useWatch({ control, name: "milk" });

  async function onSubmit(values: EntryFormValues) {
    if (!user) return;
    try {
      let photoURL = initial?.photoURL ?? null;
      if (file) {
        photoURL = await compressImageToDataUrl(file);
      } else if (existingUrl === null) {
        photoURL = null;
      }

      const input: EntryInput = {
        date: fromDateInputValue(values.date),
        coffeeName: values.coffeeName || undefined,
        cafeId: values.cafeId ?? null,
        beanId: values.beanId ?? null,
        equipmentIds: values.equipmentIds,
        brewType: values.brewType,
        milk: values.milk,
        milkType: values.milk ? values.milkType || null : null,
        photoURL,
        ratings: {
          aroma: values.aroma,
          flavor: values.flavor,
          aftertaste: values.aftertaste,
          acidity: values.acidity,
          body: values.body,
        },
        overallRating: values.overallRating,
        tags: values.tags,
        notes: values.notes || undefined,
      };

      const id = initial
        ? (await updateEntry(user.uid, initial.id, input), initial.id)
        : await createEntry(user.uid, input);

      toast.success(initial ? "Entry updated" : "Coffee logged");
      onDone(id);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Could not save entry");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* The basics */}
      <section className="space-y-4">
        <SectionTitle>The basics</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="entry-date">Date</Label>
            <Input id="entry-date" type="date" {...register("date")} />
            <FieldError message={errors.date?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="entry-name">Coffee name (optional)</Label>
            <Input
              id="entry-name"
              placeholder="Flat White"
              {...register("coffeeName")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="entry-brew">Brew type</Label>
            <Controller
              control={control}
              name="brewType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="entry-brew" className="w-full">
                    <SelectValue placeholder="Select brew" />
                  </SelectTrigger>
                  <SelectContent>
                    {BREW_TYPES.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.brewType?.message} />
          </div>
          <div className="space-y-1.5">
            <Label>Café</Label>
            <div className="flex gap-2">
              <Controller
                control={control}
                name="cafeId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? NONE}
                    onValueChange={(v) => field.onChange(v === NONE ? null : v)}
                  >
                    <SelectTrigger className="w-full flex-1">
                      <SelectValue placeholder="Select café" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>No café / at home</SelectItem>
                      {cafes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <CafeDialog
                trigger={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Add café"
                  >
                    <PlusIcon className="size-4" />
                  </Button>
                }
                onSaved={(id) => setValue("cafeId", id)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Bean</Label>
            <div className="flex gap-2">
              <Controller
                control={control}
                name="beanId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? NONE}
                    onValueChange={(v) => field.onChange(v === NONE ? null : v)}
                  >
                    <SelectTrigger className="w-full flex-1">
                      <SelectValue placeholder="Select bean" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Not sure / none</SelectItem>
                      {beans.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <BeanDialog
                trigger={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Add bean"
                  >
                    <PlusIcon className="size-4" />
                  </Button>
                }
                onSaved={(id) => setValue("beanId", id)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Switch
              id="entry-milk"
              checked={milk}
              onCheckedChange={(v) => setValue("milk", v)}
            />
            <Label htmlFor="entry-milk" className="cursor-pointer">
              With milk
            </Label>
          </div>
          {milk && (
            <Input
              className="sm:max-w-xs"
              placeholder="Milk type (e.g. Oat, Whole)"
              {...register("milkType")}
            />
          )}
        </div>

        {equipment.length > 0 && (
          <div className="space-y-2">
            <Label>Equipment used</Label>
            <Controller
              control={control}
              name="equipmentIds"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {equipment.map((eq) => {
                    const active = field.value.includes(eq.id);
                    return (
                      <button
                        key={eq.id}
                        type="button"
                        onClick={() =>
                          field.onChange(
                            active
                              ? field.value.filter((id) => id !== eq.id)
                              : [...field.value, eq.id],
                          )
                        }
                        className={cn(
                          "rounded-full border px-3 py-1 text-sm transition-colors",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card hover:bg-muted",
                        )}
                      >
                        {eq.name}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>
        )}
      </section>

      {/* Ratings */}
      <section className="space-y-4">
        <SectionTitle>How it tastes</SectionTitle>
        <p className="-mt-2 text-xs text-muted-foreground">1 = not for me · 10 = exceptional</p>
        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {RATING_ATTRIBUTES.map((attr) => (
            <Controller
              key={attr}
              control={control}
              name={attr}
              render={({ field }) => (
                <RatingSlider
                  id={`rating-${attr}`}
                  label={RATING_LABELS[attr]}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          ))}
        </div>
        <div className="rounded-lg border bg-card/50 p-4">
          <Controller
            control={control}
            name="overallRating"
            render={({ field }) => (
              <RatingSlider
                id="rating-overall"
                label="Overall"
                value={field.value}
                onChange={field.onChange}
                description="Your single all-things-considered score."
              />
            )}
          />
        </div>
      </section>

      {/* Notes & tags */}
      <section className="space-y-4">
        <SectionTitle>Notes &amp; flavors</SectionTitle>
        <div className="space-y-1.5">
          <Label htmlFor="entry-tags">Flavor notes</Label>
          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <TagInput
                id="entry-tags"
                value={field.value}
                onChange={field.onChange}
                suggestions={SUGGESTED_TAGS}
              />
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="entry-notes">Notes</Label>
          <Textarea
            id="entry-notes"
            rows={4}
            placeholder="How was it? Where, when, with whom…"
            {...register("notes")}
          />
        </div>
      </section>

      {/* Photo */}
      <section className="space-y-3">
        <SectionTitle>Photo</SectionTitle>
        <ImageUploader
          existingUrl={existingUrl}
          alt="Coffee photo"
          onChange={setFile}
          onRemove={() => setExistingUrl(null)}
        />
      </section>

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t bg-background/85 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : initial ? "Save changes" : "Save entry"}
        </Button>
      </div>
    </form>
  );
}
