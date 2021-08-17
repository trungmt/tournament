import path from 'path';
import multer from 'multer';
import sharp from 'sharp';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500000, // 5MB
  },
  fileFilter(req, file, cb) {
    const fileExtPattern = /^.(jpg|jpeg|png|gif|tiff)$/;
    const fileExt = path.extname(file.originalname).toLowerCase();
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
  const resizeBuffer = await sharp(file)
    .resize({ width, height })
    .png()
    .toBuffer();
  return resizeBuffer;
};
