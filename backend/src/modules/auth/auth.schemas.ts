import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .refine((value) => Buffer.byteLength(value, 'utf8') <= 72, {
    message: 'Password must not exceed 72 bytes when encoded as UTF-8.',
  });

export const registerSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: passwordSchema,
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
});

export const loginSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: passwordSchema,
});
