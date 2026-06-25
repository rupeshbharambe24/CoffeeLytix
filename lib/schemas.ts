import { z } from "zod";
import { BREW_TYPES, EQUIPMENT_TYPES, ROAST_LEVELS } from "@/lib/types";

const optionalText = z.string().trim().optional().or(z.literal(""));

export const entryFormSchema = z.object({
  date: z.string().min(1, "Please pick a date"),
  coffeeName: z.string().trim().max(120).optional().or(z.literal("")),
  cafeId: z.string().optional().nullable(),
  beanId: z.string().optional().nullable(),
  equipmentIds: z.array(z.string()),
  brewType: z.enum(BREW_TYPES),
  milk: z.boolean(),
  milkType: z.string().optional().nullable(),
  aroma: z.number().min(1).max(10),
  flavor: z.number().min(1).max(10),
  aftertaste: z.number().min(1).max(10),
  acidity: z.number().min(1).max(10),
  body: z.number().min(1).max(10),
  overallRating: z.number().min(1).max(10),
  tags: z.array(z.string()),
  notes: z.string().max(2000).optional().or(z.literal("")),
});
export type EntryFormValues = z.infer<typeof entryFormSchema>;

export const beanFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  brand: optionalText,
  roast: z.enum(ROAST_LEVELS),
  origin: optionalText,
  tastingNotes: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type BeanFormValues = z.infer<typeof beanFormSchema>;

export const cafeFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  address: optionalText,
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type CafeFormValues = z.infer<typeof cafeFormSchema>;

export const equipmentFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  type: z.enum(EQUIPMENT_TYPES),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  rating: z.number().min(1).max(10).nullable().optional(),
});
export type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

export const profileFormSchema = z.object({
  displayName: z.string().trim().min(1, "Name is required").max(80),
});
export type ProfileFormValues = z.infer<typeof profileFormSchema>;
