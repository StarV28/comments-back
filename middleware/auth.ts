// middleware/auth.ts
import { Request, Response, NextFunction, Express } from "express";
import { parseBearer } from "../utils/jwtHelpers.js";

export interface JwtPayload {
  id: number;
  username?: string;
}

const auth = (app: Express): void => {
  // CORS Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    next();
  });
  // JWT Authentication Middleware
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    const openPaths = ["/api/auth/login", "/api/auth/signUp", "/uploads/"];
    const isOpen = openPaths.some((p) => req.path.startsWith(p));
    if (isOpen) return next();

    try {
      if (!req.headers.authorization) {
        return res.status(401).json({
          result: "Access Denied: No Authorization header provided",
        });
      }

      // Формируем хедеры для подписи токена
      const headers: { [key: string]: string | undefined } = {};
      for (const [key, value] of Object.entries(req.headers)) {
        headers[key] = Array.isArray(value) ? value[0] : value;
      }

      // Сохраняем расшифрованный токен в req.user
      req.user = parseBearer(req.headers.authorization);
    } catch (err: unknown) {
      return res.status(401).json({
        result: "Access Denied: Invalid token",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }

    next();
  });
};

export default auth;
