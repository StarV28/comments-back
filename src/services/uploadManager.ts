import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import prisma from "../../prisma/prisma.js";
import { FileType } from "@prisma/client";

class UploadManager {
  private uploadDir = path.resolve("uploads");

  async handleUpload(file: Express.Multer.File, commentId: number) {
    await this.ensureUploadDirExists();

    if (file.mimetype.startsWith("image/")) {
      return this.processImage(file, commentId);
    }

    if (file.mimetype === "text/plain") {
      return this.processTextFile(file, commentId);
    }

    throw new Error("Unsupported file type");
  }

  private async processImage(file: Express.Multer.File, commentId: number) {
    const ext = path.extname(file.originalname) || ".jpg";
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    const metadata = await sharp(file.buffer).metadata();

    await sharp(file.buffer)
      .resize(320, 240, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toFile(filePath);

    const { size } = await fs.stat(filePath);

    return prisma.file.create({
      data: {
        type: FileType.image,
        path: `/uploads/${filename}`,
        originalName: file.originalname,
        size,
        width: metadata.width,
        height: metadata.height,
        commentId,
      },
    });
  }

  private async processTextFile(file: Express.Multer.File, commentId: number) {
    const ext = path.extname(file.originalname) || ".txt";
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    const content = file.buffer.toString("utf-8");
    await fs.writeFile(filePath, content, "utf-8");

    return prisma.file.create({
      data: {
        type: FileType.txt,
        path: `/uploads/${filename}`,
        originalName: file.originalname,
        size: file.size,
        commentId,
      },
    });
  }

  private async ensureUploadDirExists() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }
}

export const uploadManager = new UploadManager();
