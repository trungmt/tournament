import path from 'path';
import multer, { MulterError } from 'multer';
import sharp from 'sharp';
import { RequestHandler, Request, Response, NextFunction } from 'express';
import BaseError from '../exceptions/BaseError';

const uploadConfig = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter(req, file, cb) {
    const fieldName = file.fieldname;
    const fileExtPattern = /^.(jpg|jpeg|png|gif|tiff)$/;
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (!req.errors) req.errors = {};
    if (!req.body) req.body = {};

    if (!fileExtPattern.test(fileExt)) {
      req.errors![
        fieldName
      ] = `File type not allowed. Please upload image with these types: jpg, jpeg, png, gif, tiff`;
    }

    cb(null, true);
  },
});

export const uploadSingleFile = (fieldName: string): RequestHandler => {
  const uploadHandler = uploadConfig.single(fieldName);

  const uploadSingleFileErrorHandler = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    uploadHandler(req, res, function (error) {
      if (!error) {
        req.body[fieldName] = req.file;
        next();
        return;
      }

      if (error instanceof MulterError) {
        req.errors![fieldName] = error.message;
        next();
        return;
      }

      next(error);
    });
  };

  return uploadSingleFileErrorHandler;
};

export const resizeImage = async (
  file: Buffer,
  width: number,
  height: number
): Promise<Buffer> => {
  let result = Buffer.alloc(0);
  if (file.length === 0) return result;

  try {
    result = await sharp(file).resize({ width, height }).png().toBuffer();
  } catch (error) {
    if (error instanceof Error) {
      throw new BaseError(error.message, error.name, 422, true);
    }
  }
  return result;
};
