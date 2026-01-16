import dotenv from "dotenv";
dotenv.config();

export interface Config {
  port?: string;
  jwtSecret?: string;
  base_url?: string;
  email: {
    user?: string;
    password?: string;
  };
}

const config: Config = {
  port: process.env.PORT || "3000",
  jwtSecret: process.env.JWT_SECRET,
  base_url: process.env.BASE_URL,
  email: {
    user: process.env.MAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  },
};

export default Object.freeze(config);
