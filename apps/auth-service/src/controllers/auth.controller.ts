import type { Request, Response } from "express";
import { ZodError } from "zod";

import { UserService } from "../service/user.service";
import {
  signupSchema,
  signinSchema,
} from "../schema/user.schema";

const userService = new UserService();

export const signup = async (req: Request, res: Response) => {
  try {
    console.log("hi")
    console.log(req.body);
    const body = signupSchema.parse(req.body);
    const result = await userService.signup(body);

    return res.status(201).json(result);
  } catch (err) {
    return handleError(err, res, "Signup failed");
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const body = signinSchema.parse(req.body);
    const result = await userService.signin(body);

    return res.status(200).json(result);
  } catch (err) {
    return handleError(err, res, "Signin failed");
  }
};

export const health = (_req: Request, res: Response) => {
  return res.status(200).json({ status: "ok" });
};

const handleError = (
  err: unknown,
  res: Response,
  fallback: string
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: err.flatten(),
    });
  }

  const message =
    err instanceof Error ? err.message : fallback;

  if (message === "User already exists") {
    return res.status(409).json({ error: message });
  }

  if (message === "Invalid credentials") {
    return res.status(401).json({ error: message });
  }

  return res.status(500).json({ error: message });
};
