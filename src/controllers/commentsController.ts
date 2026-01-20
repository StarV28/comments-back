import { Request, Response } from "express";
import CommentsService from "../modules/comments/comments.service.js";
import { broadcastToClients } from "../ws/setupWs.js";

export default class CommentsController {
  //---------------------------------------//

  static async create(req: Request, res: Response) {
    try {
      const { content, parentId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!content || typeof content !== "string") {
        return res.status(400).json({ message: "Content is required" });
      }

      const parentIdNum = parentId ? Number(parentId) : null;

      const comment = await CommentsService.create(
        userId,
        parentIdNum,
        content,
        req.file ?? null,
      );

      broadcastToClients({
        type: parentIdNum ? "replies" : "comment",
        payload: {
          ...comment.comment,
          files: comment.file ?? null,
        },
      });

      return res.status(201).json({ ...comment });
    } catch (err) {
      return res
        .status(400)
        .json({ message: (err as Error)?.message || "Create failed" });
    }
  }

  //---------------------------------------//

  static async getList(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const sortByRaw = (req.query.sortBy as string) || "createdAt";
      const orderRaw = req.query.order === "asc" ? "asc" : "desc";
      const allowedSort = ["username", "email", "createdAt"] as const;
      const sortBy = (allowedSort as readonly string[]).includes(sortByRaw)
        ? (sortByRaw as "username" | "email" | "createdAt")
        : "createdAt";

      const result = await CommentsService.getRootComments(
        page,
        sortBy,
        orderRaw,
      );

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

  static async getReplies(req: Request, res: Response) {
    try {
      const parentId = Number(req.params.id);

      if (!parentId) {
        return res.status(400).json({ message: "Invalid parent id" });
      }

      const replies = await CommentsService.getReplies(parentId);
      return res.status(200).json({ replies });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  //---------------------------------------//

  // static async update(req: Request, res: Response) {
  //   try {
  //     const { content } = req.body;
  //     const commentId = Number(req.params.id);
  //     const userId = req.user?.id;

  //     if (!userId) {
  //       return res.status(401).json({ message: "Unauthorized" });
  //     }

  //     if (!content || typeof content !== "string") {
  //       return res.status(400).json({ message: "Content is required" });
  //     }

  //     const updated = await CommentsService.update(userId, commentId, content);

  //     return res.status(200).json({ comment: updated });
  //   } catch (err) {
  //     return res
  //       .status(400)
  //       .json({ message: (err as Error)?.message || "Update failed" });
  //   }
  // }

  //---------------------------------------//

  static async delete(req: Request, res: Response) {
    try {
      const commentId = Number(req.params.id);
      const userId = req.user?.id;
      const fileId = req.params.fileId ? Number(req.params.fileId) : null;
      const parentId = Number(req.params.parentId);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await CommentsService.delete(commentId, userId, fileId);
      if (result) {
        broadcastToClients({
          type: "delete",
          payload: { id: commentId, parentId },
        });
        return res.status(200).json({ success: result });
      }
    } catch (err) {
      return res
        .status(400)
        .json({ message: (err as Error)?.message || "Delete failed" });
    }
  }
}
