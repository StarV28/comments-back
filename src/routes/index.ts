import express, { Router } from "express";
import commentsRouter from "./comments.js";
import userRouter from "./user.js";
import authRouter from "./auth.js";

const router: Router = express.Router();

router.use("/comments", commentsRouter);
router.use("/user", userRouter);
router.use("/auth", authRouter);

export default router;
