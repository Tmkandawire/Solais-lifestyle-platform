import { z } from 'zod';

/**
 * Scaffolded for a future admin-facing lookup (e.g. GET /account/:id).
 * Not currently wired into any route.
 */
export const accountIdSchema = z.object({
  id: z.uuid('Account ID must be a valid UUID.'),
});
export type AccountIdInput = z.infer<typeof accountIdSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Your new password must be different from your current password.',
    path: ['newPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const updateAccountProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required.')
    .max(80, 'First name must not exceed 80 characters.'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required.')
    .max(80, 'Last name must not exceed 80 characters.'),
});

export type UpdateAccountProfileInput = z.infer<typeof updateAccountProfileSchema>;

export const updateThemePreferenceSchema = z.object({
  theme: z.enum(['LIGHT', 'DARK']),
});

export type UpdateThemePreferenceInput = z.infer<typeof updateThemePreferenceSchema>;
