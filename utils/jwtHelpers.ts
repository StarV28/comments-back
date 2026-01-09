import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import config from "../config/index.js";

const JWT_SECRET = config.jwtSecret as string;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}

const EXPIRES_IN = "60m";

export interface DecodedToken extends JwtPayload {
  id: number;
  email: string;
}

export function prepareToken(payload: object): string {
  const options: SignOptions = { expiresIn: EXPIRES_IN };

  return jwt.sign(payload, JWT_SECRET, options);
}

export function parseBearer(bearer: string): DecodedToken {
  if (!bearer.startsWith("Bearer ")) {
    throw new Error("Bearer token missing");
  }

  const token = bearer.substring(7);

  const decoded = jwt.verify(token, JWT_SECRET);

  if (!decoded || typeof decoded !== "object") {
    throw new Error("Invalid token");
  }

  return decoded as DecodedToken;
}
