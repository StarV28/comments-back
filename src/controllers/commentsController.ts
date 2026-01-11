import { Request, Response } from "express";
import CommentsService from "../modules/comments/comments.service.js";

//-------------------------------------------------------------------------------------//

export default class CommentsController {
  //---------------------------------------//
  static async createComments(req: Request, res: Response) {
    try {
      const { text, parentId } = req.body;
      const userId = req.user?.id;

      if (!text || !userId) {
        return res.status(400).json({ message: "Text and user required" });
      }

      const comment = await CommentsService.create(userId, parentId, text);
      if (!comment) {
        return res.status(401).json({ success: false });
      }
      return res.status(201).json({ success: true, comment });
    } catch (err: unknown) {
      res.status(500).json({ message: "Server error", err });
    }
  }
  //---------------------------------------//
  static async getCommentsList(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;

      const sortBy = (req.query.sortBy as string) || "createdAt";
      const order = req.query.order === "asc" ? "asc" : "desc";

      const result = await CommentsService.getList(page, sortBy, order);

      return res.status(200).json({
        comments: result.comments,
        pagination: {
          total: result.total,
          totalPages: result.totalPages,
          currentPage: page,
          limit: result.limit,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  //---------------------------------------//
  static async updateComments(req: Request, res: Response) {
    try {
      const { text } = req.body;
      const id = parseInt(req.params.id, 10);
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const comment = await CommentsService.update(userId, id, text);

      if (comment.count === 0) {
        return res
          .status(404)
          .json({ message: "Comment not found or not yours" });
      }

      return res.status(200).json({ comment });
    } catch (err: unknown) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
  //---------------------------------------//
  static async deleteComments(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await CommentsService.deleteCommentsService(
        parseInt(id),
        userId
      );

      if (!result) {
        return res
          .status(404)
          .json({ message: "Comment not found or not yours" });
      }

      return res.status(200).json({ message: "Comment deleted successfully" });
    } catch (err: unknown) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
}
