import path from 'path';
import { RequestHandler, Request, Response, NextFunction } from 'express';
import { ObjectID } from 'mongodb';
import multer, { MulterError, Multer } from 'multer';
import { verifyFileExtension } from '../services/FileService';

/**
 * Function to generate Multer instance that consists configs
 * for uploading SINGLE file to host's disk storage
 * @param tempDestination string | undefined temp destination to store uploaded file
 * @returns multer.Multer instance that
 */
const generateDiskUploadConfig = (
  tempDestination: string | undefined = undefined
): Multer =>
  multer({
    storage: multer.diskStorage({
      destination: tempDestination,
      filename: function (req, file, cb) {
        const fileName =
          new ObjectID() + path.extname(file.originalname).toLowerCase();
        cb(null, fileName);
      },
    }),
    limits: {
      fileSize: parseInt(process.env.DEFAULT_IMAGE_SIZE_LIMIT!),
      files: 1,
    },
    fileFilter(req, file, cb) {
      const fieldName = file.fieldname;
      const fileExt = path.extname(file.originalname).toLowerCase();
      if (!req.errors) req.errors = {};
      if (!req.body) req.body = {};

      if (
        !verifyFileExtension(
          fileExt,
          process.env.ACCEPT_IMAGE_EXTENSION_PATTERN!
        )
      ) {
        req.errors![
          fieldName
        ] = `File type not allowed. Please upload image with these types: jpg, jpeg, png, gif, tiff`;
        // TODO: put error messages into a lang file same as codeigniter
        return cb(null, false);
      }

      cb(null, true);
    },
  });

export const uploadSingleFile = (
  fieldName: string,
  entityName: string | undefined = undefined
): RequestHandler => {
  let destination = process.env.UPLOAD_TEMP_FILE_DIR;
  if (typeof destination !== 'undefined' && typeof entityName !== 'undefined') {
    destination += `${entityName}`;
  }

  const uploadConfig = generateDiskUploadConfig(destination);
  const uploadHandler = uploadConfig.single(fieldName);

  const uploadSingleFileErrorHandler = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    uploadHandler(req, res, async function (error) {
      if (req.errors && req.errors[fieldName]) {
        next();
        return;
      }

      if (error) {
        if (error instanceof MulterError) {
          req.errors![fieldName] = error.message;
          next();
        } else {
          next(error);
        }
        return;
      }

      req.body[fieldName] = req.file;
      next();
    });
  };

  return uploadSingleFileErrorHandler;
};
