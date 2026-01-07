import express, { Router } from "express";
import Comments from "../controllers/commentsController.js";

const router: Router = express.Router();

router.post("/create", Comments.createComments);

router.get("/get", Comments.getCommentsList);

router.post("/update", Comments.updateComments);

router.delete("/del", Comments.deleteComments);

export default router;
