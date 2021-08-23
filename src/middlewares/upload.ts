import path from 'path';
import multer, { MulterError } from 'multer';
import sharp from 'sharp';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500000, // 5MB
  },
  fileFilter(req, file, cb) {
    const fileExtPattern = /^.(jpg|jpeg|png|gif|tiff)$/;
    const fileExt = path.extname(file.originalname).toLowerCase();
    // console.log('file.mimetype', file.mimetype);

    if (!fileExtPattern.test(fileExt)) {
      cb(
        new Error(
          `File type not allowed. Please upload image with these types: jpg, jpeg, png, gif, tiff`
        )
      );
    }

    cb(null, true);
  },
});

export const resizeImage = async (
  file: Buffer,
  width: number,
  height: number
): Promise<Buffer> => {
  if (file.length === 0) return Buffer.alloc(0);

  return await sharp(file).resize({ width, height }).png().toBuffer();
};
