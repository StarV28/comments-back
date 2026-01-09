import { Request, Response } from "express";
import prisma from "../../prisma/prisma.js";

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
      if (parentId) {
        const parentExists = await prisma.comment.findUnique({
          where: { id: parentId },
        });
        if (!parentExists) {
          return res.status(400).json({ message: "Parent comment not found" });
        }
      }

      const comment = await prisma.comment.create({
        data: {
          text,
          userId,
          parentId: parentId || null,
        },
      });

      return res.status(201).json({ comment });
    } catch (err: unknown) {
      res.status(500).json({ message: "Server error", err });
    }
  }
  //---------------------------------------//
  static async getCommentsList(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = 25;
      const skip = (page - 1) * limit;

      const sortBy = (req.query.sortBy as string) || "createdAt";
      const order = req.query.order === "asc" ? "asc" : "desc";

      let orderBy: {
        user?: { username?: "asc" | "desc"; email?: "asc" | "desc" };
        createdAt?: "asc" | "desc";
      };

      switch (sortBy) {
        case "username":
          orderBy = { user: { username: order } };
          break;
        case "email":
          orderBy = { user: { email: order } };
          break;
        case "createdAt":
        default:
          orderBy = { createdAt: order };
          break;
      }

      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where: { parentId: null },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
                files: true,
              },
            },
            files: true,
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.comment.count({
          where: { parentId: null },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return res.status(200).json({
        comments,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
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

      const comment = await prisma.comment.updateMany({
        where: { id, userId },
        data: { text },
      });

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

      const commentExists = await prisma.comment.findFirst({
        where: { id: parseInt(id), userId: userId },
      });

      if (!commentExists) {
        return res
          .status(404)
          .json({ message: "Comment not found or not yours" });
      }

      await prisma.comment.delete({
        where: { id: parseInt(id) },
      });

      return res.status(200).json({ message: "Comment deleted successfully" });
    } catch (err: unknown) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
}
