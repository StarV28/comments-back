import dotenv from "dotenv";
dotenv.config();

export interface Config {
  port?: string;
  jwtSecret?: string;
  email: {
    user?: string;
    password?: string;
  };
}

const config: Config = {
  port: process.env.PORT || "3000",
  jwtSecret: process.env.JWT_SECRET,
  email: {
    user: process.env.MAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  },
};

export default Object.freeze(config);
