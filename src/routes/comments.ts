import express, { Router } from "express";
import CommentsController from "../controllers/commentsController.js";

const router: Router = express.Router();

router.post("/", CommentsController.createComments);

router.get("/", CommentsController.getCommentsList);

router.put("/:id", CommentsController.updateComments);

router.delete("/:id", CommentsController.deleteComments);

export default router;
