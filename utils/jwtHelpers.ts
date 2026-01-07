import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Проверяем наличие JWT_SECRET
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}

// Час дії токена
const expiresIn: string = "60m";

// Секретний ключ для токена
const tokenKey: string = process.env.JWT_SECRET;

// Інтерфейс для заголовків
interface Headers {
  "user-agent"?: string;
  "accept-language"?: string;
  [key: string]: string | undefined;
}

// Інтерфейс для декодованого токена
interface DecodedToken {
  id: number;
  [key: string]: unknown;
}

// Функція для парсингу Bearer токена та декодування користувача
export function parseBearer(bearer: string, headers: Headers): DecodedToken {
  let token: string | undefined;
  if (bearer.startsWith("Bearer ")) {
    token = bearer.slice(7);
  }

  try {
    const decoded = jwt.verify(
      token || "",
      prepareSecret(headers)
    ) as DecodedToken;
    return decoded;
  } catch {
    throw new Error("Invalid token");
  }
}

// Функція для створення JWT токена
export function prepareToken(data: object, headers: Headers): string {
  return jwt.sign(data, prepareSecret(headers), {
    expiresIn,
  } as jwt.SignOptions);
}

// Функція для підготовки секретного ключа з додаванням заголовків
function prepareSecret(headers: Headers): string {
  return (
    tokenKey +
    (headers["user-agent"] || "") +
    (headers["accept-language"] || "")
  );
}
