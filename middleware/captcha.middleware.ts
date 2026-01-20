import { Request, Response, NextFunction } from "express";
import config from "../config/index.js";
import axios from "axios";

export const captchaMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (
    process.env.CAPTCHA_ENABLED === "false" ||
    process.env.NODE_ENV === "development"
  ) {
    return next();
  }

  const captchaToken = req.body.captchaToken || req.body.data?.captchaToken;

  if (!captchaToken) {
    return res.status(400).json({
      message: "Captcha token is required",
    });
  }

  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: config.recaptcha,
          response: captchaToken,
          remoteip: req.ip,
        },
      },
    );

    const { success, score } = response.data;

    if (!success || score < 0.5) {
      return res.status(403).json({
        message: "Captcha validation failed",
      });
    }

    next();
  } catch (err) {
    console.error("Error server Captcha", (err as Error)?.message);
    return res.status(500).json({
      message: "Captcha service error",
    });
  }
};
