import express, { Router } from "express";
import AuthController from "../controllers/authController.js";

const router: Router = express.Router();

router.post("/signUp", AuthController.createUser);

router.post("/login", AuthController.logInUser);

export default router;
