import path from 'path';
import { readdir, stat, unlink } from 'fs/promises';
import { RequestHandler, Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import sharp from 'sharp';
import { ObjectID } from 'mongodb';
import BaseError from '../exceptions/BaseError';
import FileType, { FileTypeResult } from 'file-type';

/**
 * Function to generate Multer instance that consists configs
 * for uploading SINGLE file to host's disk storage
 * @param tempDestination string | undefined temp destination to store uploaded file
 * @returns multer.Multer instance that
 */
const generateDiskUploadConfig = (
  tempDestination: string | undefined = undefined
) =>
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
  let destination = process.env.TEMP_FILE_DIR;
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
      if (req.errors![fieldName]) {
        next();
        return;
      }

      if (error) {
        if (error instanceof MulterError) {
          req.errors![fieldName] = error.message;
          next();
          return;
        }

        next(error);
        return;
      }

      const fileType = await getFileTypeFromDisk(req.file!.path);
      if (
        typeof fileType === 'undefined' ||
        !verifyFileExtension(
          fileType.ext,
          process.env.ACCEPT_IMAGE_EXTENSION_PATTERN!
        )
      ) {
        req.errors![
          fieldName
        ] = `File type not allowed. Please upload image with these types: jpg, jpeg, png, gif, tiff`;
      } else {
        req.body[fieldName] = req.file;
        next();
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

const getFileTypeFromDisk = async (
  filePath: string
): Promise<FileTypeResult | undefined> => {
  // TODO: how to handle error when async running?
  return await FileType.fromFile(filePath);
};

const verifyFileExtension = (
  fileExtension: string,
  acceptedExtension: RegExp | string[] | string
): boolean => {
  if (Array.isArray(acceptedExtension)) {
    acceptedExtension = `/^${acceptedExtension.join('|')}$/`;
  }

  const acceptedExtensionRegex = new RegExp(acceptedExtension);
  return acceptedExtensionRegex.test(fileExtension);
};

export const removeOldTempFiles = async (
  removeTimeMs: number,
  dirname: string = process.env.TEMP_FILE_DIR!
) => {
  console.log('dirname', dirname);
  try {
    const currentTimestamp = new Date().getTime();

    // list files and directories in `dirname`
    const files = await readdir(dirname, { withFileTypes: true });

    // loop through files and directory in `dirname`
    files.forEach(async dirent => {
      const filePath = path.join(dirname, dirent.name);

      // wont touch special files
      if (dirent.name === '.gitkeep') {
        return;
      }

      // if `filePath` is directory, do removeOldTempFiles(timeDistance, `filePath`)
      if (dirent.isDirectory()) {
        removeOldTempFiles(removeTimeMs, filePath);
        return;
      }

      // if `filepath` is file get status of file for file's modification time
      const fileStat = await stat(filePath);

      console.log('mtimeMS', fileStat.mtimeMs);
      console.log(
        'currentTimestamp - removeTimeMs',
        currentTimestamp - removeTimeMs
      );

      // if file modification date is older than removeTimeMs --> delete that file
      if (fileStat.mtimeMs < currentTimestamp - removeTimeMs) {
        console.log(filePath, 'deleted');
        unlink(filePath);
        return;
      }
      console.log(filePath, 'NOT deleted');
      return;
    });
  } catch (error) {
    console.log(error);
  }
};
