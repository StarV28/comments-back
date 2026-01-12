import express, { Router } from "express";
import CommentsController from "../controllers/commentsController.js";

const router: Router = express.Router();

router.post("/", CommentsController.create);

router.get("/", CommentsController.getList);

router.get("/:id/replies", CommentsController.getReplies);

router.put("/:id", CommentsController.update);

router.delete("/:id", CommentsController.delete);

export default router;
