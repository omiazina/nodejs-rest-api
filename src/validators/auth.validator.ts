import { z } from "zod";

export const registerBodySchema = z.object({
  username: z.string().min(3).max(30),
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

export const loginBodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1),
});
