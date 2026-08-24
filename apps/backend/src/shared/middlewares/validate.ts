// src/middlewares/validate.ts
import { RequestHandler } from 'express';
import { ZodType } from 'zod';

export const validate =
  (schema: ZodType): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ success: false, errors: result.error.flatten() });
      return;
    }
    req.body = result.data;
    next();
  };
