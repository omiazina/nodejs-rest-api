import { z } from "zod";

export const announcementCategories = [
  "sale",
  "service",
  "job",
  "other",
] as const;

export const createAnnouncementBodySchema = z.object({
  title: z.string().min(5).max(50),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  category: z.enum(announcementCategories),
});

export const updateAnnouncementFieldsSchema = z.object({
  title: z.string().min(5).max(50).optional(),
  description: z.string().min(10).optional(),
  price: z.coerce.number().positive().optional(),
  category: z.enum(announcementCategories).optional(),
});

export const updateAnnouncementBodySchema = updateAnnouncementFieldsSchema.refine(
  (data) => Object.values(data).some((value) => value !== undefined),
  {
    message: "At least one field must be provided",
  },
);

export const announcementIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const announcementsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  search: z.string().optional(),
  sort: z.enum(["newest", "oldest"]).optional().default("newest"),
});
