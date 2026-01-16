import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import config from "../../config/index.js";

export type UploadResult = {
  path: string;
  url: string;
  originalName: string;
  size: number;
  type: "image" | "txt";
  width?: number;
  height?: number;
};

export class UploadManager {
  private uploadDir: string;

  constructor(uploadDir = "uploads") {
    this.uploadDir = path.join(process.cwd(), uploadDir);
  }

  private async ensureUploadDir() {
    await fs.mkdir(this.uploadDir, { recursive: true });
  }

  async handleFile(file: Express.Multer.File): Promise<UploadResult> {
    await this.ensureUploadDir();

    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    const fullPath = path.join(this.uploadDir, filename);

    if (ext === ".txt") {
      await fs.writeFile(fullPath, file.buffer);

      const stat = await fs.stat(fullPath);
      return {
        path: `/uploads/${filename}`,
        url: `${config.base_url}/uploads/${filename}`,
        originalName: file.originalname,
        size: stat.size,
        type: "txt",
      };
    }

    if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext)) {
      await sharp(file.buffer)
        .resize(320, 240, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toFile(fullPath);

      const meta = await sharp(fullPath).metadata();
      const stat = await fs.stat(fullPath);

      return {
        url: `${config.base_url}/uploads/${filename}`,
        path: `/uploads/${filename}`,
        originalName: file.originalname,
        size: stat.size,
        type: "image",
        width: meta.width,
        height: meta.height,
      };
    }

    throw new Error(`Unsupported file type: ${ext}`);
  }

  async deleteFile(filePath: string) {
    const fullPath = path.join(process.cwd(), filePath);
    try {
      await fs.unlink(fullPath);
    } catch (err) {
      console.warn("File not found or already deleted:", fullPath);
      throw err;
    }
  }
}
