import prisma from "../../../prisma/prisma.js";

//-------------------------------------------------------------------------------------//

export default class CommentsService {
  //---------------------------------------//
  static async create(userId: number, parentId: number, text: string) {
    try {
      if (parentId) {
        const parentExists = await prisma.comment.findUnique({
          where: { id: parentId },
        });
        if (!parentExists) {
          return false;
        }
      }

      const comment = await prisma.comment.create({
        data: {
          text,
          userId,
          parentId: parentId || null,
        },
      });
      return comment;
    } catch (err) {
      console.error("Error create comments services", (err as Error)?.message);
      throw err;
    }
  }
  //---------------------------------------//

  static async getList(page: number, sortBy: string, order: string) {
    try {
      const limit = 25;
      const skip = (page - 1) * limit;

      let orderBy: {
        user?: { username?: "asc" | "desc"; email?: "asc" | "desc" };
        createdAt?: "asc" | "desc";
      };

      switch (sortBy) {
        case "username":
          orderBy = { user: { username: order as "asc" | "desc" } };
          break;
        case "email":
          orderBy = { user: { email: order as "asc" | "desc" } };
          break;
        case "createdAt":
        default:
          orderBy = { createdAt: order as "asc" | "desc" };
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
      return {
        comments: comments,
        total: total,
        totalPages: totalPages,
        limit,
      };
    } catch (err) {
      console.error(
        "Error getting comments list services",
        (err as Error)?.message
      );
      throw err;
    }
  }
  //---------------------------------------//
  static async update(userId: number, id: number, text: string) {
    try {
      const comment = await prisma.comment.updateMany({
        where: { id, userId },
        data: { text },
      });
      return comment;
    } catch (err) {
      console.error("Error update comments services", (err as Error)?.message);
      throw err;
    }
  }
  //---------------------------------------//
  static async deleteCommentsService(id: number, userId: number) {
    try {
      const commentExists = await prisma.comment.findFirst({
        where: { id: id, userId: userId },
      });
      if (!commentExists) {
        return false;
      }
      await prisma.comment.delete({
        where: { id: id },
      });
      return true;
    } catch (err) {
      console.error("Error delete comment services", (err as Error)?.message);
      throw err;
    }
  }
}
