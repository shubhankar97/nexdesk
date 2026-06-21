import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signAccessToken = (payload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiresIn });

export const verifyAccessToken = (token) => jwt.verify(token, env.jwtSecret);

export const verifyRefreshToken = (token) => jwt.verify(token, env.jwtRefreshSecret);

/** @deprecated Use verifyAccessToken */
export const verifyToken = verifyAccessToken;

/** @deprecated Use signAccessToken */
export const signToken = signAccessToken;
