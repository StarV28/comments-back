import prisma from "../../../prisma/prisma.js";
import { sanitizeContent } from "../../../utils/sanitize.js";
import { UploadManager } from "../../services/uploadManager.js";
//---------------------------------------//
const uploadManager = new UploadManager();
//---------------------------------------//

export default class CommentsService {
  // --------------------------------
  static async create(
    userId: number,
    parentId: number | null,
    content: string,
    file: Express.Multer.File | null,
  ) {
    const cleanContent = sanitizeContent(content);

    if (!cleanContent.trim()) {
      throw new Error("Empty content after sanitize");
    }

    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true },
      });

      if (!parent) {
        throw new Error("Parent comment not found");
      }
    }

    const result = await prisma.comment.create({
      data: {
        content: cleanContent,
        userId,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        files: true,
      },
    });
    let savedFile = null;
    if (file) {
      const uploadResult = await uploadManager.handleFile(file);

      savedFile = await prisma.file.create({
        data: {
          type: uploadResult.type,
          path: uploadResult.path,
          url: uploadResult.url ?? null,
          originalName: uploadResult.originalName,
          size: uploadResult.size,
          width: uploadResult.width ?? null,
          height: uploadResult.height ?? null,
          commentId: result.id,
        },
      });
    }
    const comment = {
      ...result,
      createdAt: result.createdAt.toISOString().replace("T", " ").slice(0, 19),
    };

    return { comment, file: savedFile };
  }

  // --------------------------------//
  static async getRootComments(
    page: number,
    sortBy: "username" | "email" | "createdAt",
    order: "asc" | "desc",
  ) {
    const limit = 25;
    const skip = (page - 1) * limit;

    let orderBy;

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
          files: true,
          _count: {
            select: {
              replies: true,
            },
          },
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
      comments,
      total,
      totalPages,
      limit,
    };
  }

  // --------------------------------//
  static async getReplies(parentId: number) {
    const replies = await prisma.comment.findMany({
      where: { parentId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        files: true,
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return replies;
  }

  // --------------------------------//
  // static async update(userId: number, commentId: number, content: string) {
  //   const cleanContent = sanitizeContent(content);

  //   if (!cleanContent.trim()) {
  //     throw new Error("Empty content after sanitize");
  //   }

  //   const existing = await prisma.comment.findFirst({
  //     where: {
  //       id: commentId,
  //       userId,
  //     },
  //   });

  //   if (!existing) {
  //     throw new Error("Comment not found or not owned by user");
  //   }

  //   const updated = await prisma.comment.update({
  //     where: { id: commentId },
  //     data: { content: cleanContent },
  //   });

  //   return updated;
  // }

  // --------------------------------//
  static async delete(
    commentId: number,
    userId: number,
    fileId: number | null,
  ) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { files: true },
    });

    if (!comment) return false;
    if (comment.files && fileId === comment.files.id) {
      await uploadManager.deleteFile(comment.files.path);
    }
    const result = await prisma.comment.deleteMany({
      where: {
        id: commentId,
        userId,
      },
    });
    if (result.count === 0) {
      throw new Error("Comment not found or not owned by user");
    }

    return true;
  }
}
