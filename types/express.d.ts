// types/express.d.ts
import { JwtPayload } from "../middleware/auth.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;
  }
}
