import nodemailer from "nodemailer";
import config from "../config/index.js";

// Интерфейс для опций письма
interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Проверка, что config.email имеет нужные поля
if (!config.email.user || !config.email.password) {
  throw new Error("Email configuration is missing user or password");
}

// Создание транспортера
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

// Функция отправки кода подтверждения
export const sendCodeToEmail = async (
  to: string,
  code: string
): Promise<boolean> => {
  const mailOptions: MailOptions = {
    from: `"Your Name Website" <${config.email.user}>`,
    to,
    subject: "Title",
    //  code - Massage
    text: ` ${code}`,
    html: `<p> Message <strong>${code}</strong></p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return true;
  } catch (error: unknown) {
    console.error("Error sending email:", error);
    return false;
  }
};
