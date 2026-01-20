import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "text/plain",
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only images and txt files are allowed"));
    }

    cb(null, true);
  },
});
