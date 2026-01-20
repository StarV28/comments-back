import express, { Router } from "express";
import CommentsController from "../controllers/commentsController.js";
import { upload } from "../../middleware/uploads.js";

const router: Router = express.Router();

router.post("/", upload.single("file"), CommentsController.create);

router.get("/", CommentsController.getList);

router.get("/:id/replies", CommentsController.getReplies);

router.delete("/:id/:parentId", CommentsController.delete);

router.delete("/:id/:parentId/:fileId", CommentsController.delete);

export default router;
