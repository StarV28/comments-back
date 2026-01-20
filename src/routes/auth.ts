import express, { Router } from "express";
import AuthController from "../controllers/authController.js";
import { captchaMiddleware } from "../../middleware/captcha.middleware.js";

const router: Router = express.Router();

router.post("/signUp", AuthController.createUser);

router.post("/login", captchaMiddleware, AuthController.logInUser);

router.get("/me", AuthController.authMeController);

router.delete("/:id", AuthController.deleteUserController);

export default router;
