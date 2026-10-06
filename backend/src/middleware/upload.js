import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    
    
    const prefix = req.uploadPrefix || "img";
    cb(null, `${prefix}-${req.params.id}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) return cb(null, true);
  cb(new Error("Only image files (jpeg, png, webp, gif) are allowed"));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

export const setUploadPrefix = (prefix) => (req, res, next) => {
  req.uploadPrefix = prefix;
  next();
};
