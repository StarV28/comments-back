import express, { Router } from "express";
import CommentsController from "../controllers/commentsController.js";
import { upload } from "../../middleware/uploads.js";

const router: Router = express.Router();

router.post("/", upload.single("file"), CommentsController.create);

router.get("/", CommentsController.getList);

router.get("/:id/replies", CommentsController.getReplies);

router.put("/:id", CommentsController.update);

router.delete("/:id/:fileId", CommentsController.delete);

export default router;
