import path from 'path';
import { readdir, stat, unlink, mkdir, rename, copyFile } from 'fs/promises';
import FileType, { FileTypeResult } from 'file-type';
import sharp from 'sharp';
import BaseError from '../exceptions/BaseError';

/**
 * Resize image from file stored on disk
 * @param inputFilePath string containing file path of image
 * @param width number specify width of image to resize
 * @param outputFilePath string|undefined containing output image file path
 * @returns void if outputFilePath is specified, store resized image to outputFilePath,
 *          or Buffer of resized image if outputFilePath is not specified
 */
export const resizeImage = async (
  inputFilePath: string,
  width: number,
  outputFilePath?: string,
  isDeleteInput: boolean = false
): Promise<void | Buffer> => {
  try {
    const resizedFile = sharp(inputFilePath).resize({
      fit: sharp.fit.contain,
      width,
    });

    if (typeof outputFilePath === 'undefined') {
      return await resizedFile.png().toBuffer();
    }

    await resizedFile.toFile(outputFilePath);

    if (isDeleteInput === true) {
      await unlink(inputFilePath);
    }
    return;
  } catch (error) {
    if (error instanceof Error) {
      throw new BaseError(error.message, error.name, 422, true);
    }
    throw new BaseError(
      'Error occurs when resize image',
      'Error occurs when resize image',
      500,
      true
    );
  }
};

export const getFileTypeFromDisk = async (
  filePath: string
): Promise<FileTypeResult | undefined> => {
  return await FileType.fromFile(filePath);
};

export const verifyFileExtension = (
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
  ignoreFileNames: string[] = process.env.OLD_TEMP_FILE_IGNORE_LIST!.split(','),
  dirname: string = process.env.UPLOAD_TEMP_FILE_DIR!
): Promise<boolean> => {
  let result = false;
  try {
    const currentTimestamp = new Date().getTime();

    // list files and directories in `dirname`
    const files = await readdir(dirname, { withFileTypes: true });

    // https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
    await Promise.all(
      // loop through files and directory in `dirname`
      files.map(async dirent => {
        result = true;
        const filePath = path.join(dirname, dirent.name);

        // wont touch ignore files
        // console.log('ignoreFileNames', ignoreFileNames);
        // console.log(
        //   'ignoreFileNames.includes(dirent.name)',
        //   ignoreFileNames.includes(dirent.name)
        // );

        if (
          typeof ignoreFileNames !== 'undefined' &&
          ignoreFileNames.includes(dirent.name)
        ) {
          return;
        }

        // if `filePath` is directory, do removeOldTempFiles(timeDistance, `filePath`)
        if (dirent.isDirectory()) {
          const subResult = await removeOldTempFiles(
            removeTimeMs,
            ignoreFileNames,
            filePath
          );
          return;
        }

        // if `filepath` is file get status of file for file's modification time
        const fileStat = await stat(filePath);

        // if file modification date is older than removeTimeMs --> delete that file
        if (fileStat.mtimeMs < currentTimestamp - removeTimeMs) {
          // console.log(filePath, 'deleted');
          await unlink(filePath);
          result = true;
          return result;
        }
        // console.log(filePath, 'NOT deleted');
      })
    );
  } catch (error) {
    console.log('Error removeOldTempFiles', error);
  }
  return result;
};

export const moveUploadFile = async (
  entityName: string, //TODO: make entityNames type, enum, const
  fileName: string,
  resizeWidth?: number,
  isDeleteTemp: boolean = true
): Promise<string> => {
  const tempFilePath = path.join(
    process.env.UPLOAD_TEMP_FILE_DIR!,
    entityName,
    fileName
  );
  const targetDirectory = path.join(process.env.UPLOAD_FILE_DIR!, entityName);
  const targetFilePath = path.join(targetDirectory, fileName);

  try {
    await mkdir(targetDirectory, { recursive: true });
    if (resizeWidth) {
      await resizeImage(
        tempFilePath,
        resizeWidth,
        targetFilePath,
        isDeleteTemp
      );
    } else if (isDeleteTemp === true) {
      await rename(tempFilePath, targetFilePath);
    } else {
      await copyFile(tempFilePath, targetFilePath);
    }
  } catch (error) {
    console.log('Error moveUploadFile', error);
    throw new BaseError(`Error occurs when uploading image`, '', 500, false);
  }

  return targetFilePath;
};
