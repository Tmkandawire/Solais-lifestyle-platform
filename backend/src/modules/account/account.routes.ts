import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validation.middleware.js';
import {
  changePasswordSchema,
  updateAccountProfileSchema,
  updateThemePreferenceSchema,
} from './account.schemas.js';
import {
  changePassword,
  getMe,
  getThemePreference,
  updateMe,
  updateThemePreference,
} from './account.controller.js';

export const accountRouter = Router();

accountRouter.get('/me', authenticate, getMe);
accountRouter.patch('/me', authenticate, validateBody(updateAccountProfileSchema), updateMe);
accountRouter.patch('/password', authenticate, validateBody(changePasswordSchema), changePassword);

accountRouter.get('/preferences', authenticate, getThemePreference);
accountRouter.patch(
  '/preferences',
  authenticate,
  validateBody(updateThemePreferenceSchema),
  updateThemePreference,
);
