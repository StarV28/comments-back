import express, { Router } from "express";
import commentsRouter from "./comments.js";
import userRouter from "./user.js";

const router: Router = express.Router();

// change 'use' bi get/post/put/delete
router.use("/comments", commentsRouter);
router.use("/user", userRouter);

export default router;
