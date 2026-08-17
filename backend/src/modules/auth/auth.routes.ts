import { Router } from 'express';

import { loginAccount, refreshAccessToken, registerAccount } from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', registerAccount);

authRouter.post('/login', loginAccount);

authRouter.post('/refresh', refreshAccessToken);
