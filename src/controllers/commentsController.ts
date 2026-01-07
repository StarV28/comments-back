import { Request, Response } from "express";
import prisma from "../../prisma/prisma.js";

//-------------------------------------------------------------------------------------//

export default class Comments {
  //---------------------------------------//
  static async createComments(req: Request, res: Response) {
    try {
      const { text, parentId } = req.body;
      const userId = req.user?.id;

      if (!text || !userId) {
        return res.status(400).json({ message: "Text and user required" });
      }

      const comment = await prisma.comment.create({
        data: {
          text,
          userId,
          parentId: parentId || null,
          ip: req.ip,
        },
      });

      return res.status(200).json({ comment });
    } catch (err: unknown) {
      res.status(500).json({ message: "Server error", err });
    }
  }
  //---------------------------------------//
  static async getCommentsList(req: Request, res: Response) {
    try {
      const comments = await prisma.comment.findMany({
        include: {
          user: true,
          replies: true,
          files: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({ comments });
    } catch (err: unknown) {
      res.status(500).json({ message: "Server error", err });
    }
  }
  //---------------------------------------//
  static async updateComments(req: Request, res: Response) {
    try {
      const { id, text } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const commentExists = await prisma.comment.findFirst({
        where: { id: id, userId: userId },
      });

      if (!commentExists) {
        return res
          .status(404)
          .json({ message: "Comment not found or not yours" });
      }

      const updatedComment = await prisma.comment.update({
        where: { id: id },
        data: { text },
      });

      return res.status(200).json({ comment: updatedComment });
    } catch (err) {
      res.status(500).json({ message: "Server error", err });
    }
  }
  //---------------------------------------//
  static async deleteComments(req: Request, res: Response) {
    try {
      const { id } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const commentExists = await prisma.comment.findFirst({
        where: { id: id, userId: userId },
      });

      if (!commentExists) {
        return res
          .status(404)
          .json({ message: "Comment not found or not yours" });
      }

      await prisma.comment.delete({
        where: { id: id },
      });

      return res.status(200).json({ message: "Comment deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error", err });
    }
  }
}
