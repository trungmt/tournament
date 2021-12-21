import path from 'path';
import { access } from 'fs/promises';
import { Document, FilterQuery } from 'mongoose';
import { object, string, mixed, TestFunction, SchemaOf } from 'yup';
import Team from '../models/team';
import BaseError from '../exceptions/BaseError';
import {
  getFileTypeFromDisk,
  verifyFileExtension,
} from '../services/FileService';

const flagIconFileUploadValidation: TestFunction<
  Express.Multer.File | undefined,
  Record<string, any>
> = async function (this, flagIcon) {
  if (typeof flagIcon === 'undefined') {
    return true;
  }

  let errorMessage = '';
  if (flagIcon.size === 0) {
    errorMessage = '${label} file is empty.';
  } else {
    try {
      const fileType = await getFileTypeFromDisk(flagIcon.path);
      if (
        typeof fileType === 'undefined' ||
        !verifyFileExtension(
          fileType.ext,
          process.env.ACCEPT_IMAGE_EXTENSION_PATTERN!
        )
      ) {
        errorMessage =
          'File type not allowed. Please upload image with these types: jpg, jpeg, png, gif, tiff';
      }
    } catch (error) {
      // handle system error
      const systemError = new BaseError(
        `Error occurs when validate Flag Icon`,
        '',
        500,
        false
      );

      const nextFunc = this.options.context?.next;
      if (typeof nextFunc !== 'undefined') {
        nextFunc(systemError);
      }
      return false;
    }
  }

  if (errorMessage !== '') {
    return this.createError({ message: errorMessage, type: 'custom' });
  }

  return true;
};

const flagIconFilePathValidation: TestFunction<string | undefined> =
  async function (this, value) {
    if (typeof value === 'undefined' || value === '') {
      return true;
    }
    const tempFilePath = path.join(
      process.env.UPLOAD_TEMP_FILE_DIR!,
      'teams',
      value
    );

    try {
      await access(tempFilePath);
    } catch (error) {
      return false;
    }
    return true;
  };

const duplicatePermalinkValidation: TestFunction<
  string | undefined,
  Record<string, any>
> = async function (this, permalink) {
  if (typeof permalink === 'undefined') {
    return true;
  }

  let team: (ITeamDoc & Document<any, any, ITeamDoc>) | null;
  try {
    // prepare filter, find an existing team that has same permalink
    let filter: FilterQuery<ITeamDoc> = { permalink };

    // in case edit team, try to find existing team that has same permalink
    // and not current edited team
    const _id = this.options.context?._id;
    if (typeof _id !== 'undefined') {
      filter._id = { $ne: _id };
    }

    team = await Team.findOne(filter);
  } catch (error) {
    // handle system error
    const systemError = new BaseError(
      `Error occurs when validate permalink`,
      '',
      500,
      false
    );

    const nextFunc = this.options.context?.next;
    if (typeof nextFunc !== 'undefined') {
      nextFunc(systemError);
    }
    return false;
  }

  // if there is existing team with same permalink, return validation error
  if (team) {
    return false;
  }

  return true;
};

const duplicateNameValidation: TestFunction<
  string | undefined,
  Record<string, any>
> = async function (this, name) {
  if (typeof name === 'undefined') {
    return true;
  }

  let team: (ITeamDoc & Document<any, any, ITeamDoc>) | null;
  try {
    // prepare filter, find an existing team that has same name
    let filter: FilterQuery<ITeamDoc> = { name: name.toLowerCase() };

    // in case edit team, try to find existing team that has same name
    // and not current edited team
    const _id = this.options.context?._id;
    if (typeof _id !== 'undefined') {
      filter._id = { $ne: _id };
    }

    team = await Team.findOne(filter);
  } catch (error) {
    // handle system error
    const systemError = new BaseError(
      `Error occurs when validate name`,
      '',
      500,
      false
    );

    const nextFunc = this.options.context?.next;
    if (typeof nextFunc !== 'undefined') {
      nextFunc(systemError);
    }
    return false;
  }

  // if there is existing team with same name, return validation error
  if (team) {
    return false;
  }

  return true;
};

const duplicateShortNameValidation: TestFunction<
  string | undefined,
  Record<string, any>
> = async function (this, shortName) {
  if (typeof shortName === 'undefined') {
    return true;
  }

  let team: (ITeamDoc & Document<any, any, ITeamDoc>) | null;
  try {
    // prepare filter, find an existing team that has same name
    let filter: FilterQuery<ITeamDoc> = { shortName: shortName.toLowerCase() };

    // in case edit team, try to find existing team that has same name
    // and not current edited team
    const _id = this.options.context?._id;
    if (typeof _id !== 'undefined') {
      filter._id = { $ne: _id };
    }

    team = await Team.findOne(filter);
  } catch (error) {
    // handle system error
    const systemError = new BaseError(
      `Error occurs when validate shortName`,
      '',
      500,
      false
    );

    const nextFunc = this.options.context?.next;
    if (typeof nextFunc !== 'undefined') {
      nextFunc(systemError);
    }
    return false;
  }

  // if there is existing team with same name, return validation error
  if (team) {
    return false;
  }

  return true;
};

// NOTE:(message function - https://github.com/sideway/joi/blob/83092836583a7f4ce16cbf116b8776737e80d16f/test/base.js#L1920)
export const teamFieldValidationSchema = (
  isUpdate: boolean = false
): SchemaOf<ITeamBodyForm> =>
  object({
    body: object({
      name: string()
        .required()
        .label('Name')
        .test(
          'duplicateNameValidation',
          '${label} value is already existed',
          duplicateNameValidation
        ),
      shortName: string()
        .required()
        .label('Short Name')
        .test(
          'duplicateShortNameValidation',
          '${label} value is already existed',
          duplicateShortNameValidation
        ),
      permalink: string()
        .required()
        .matches(
          /^([a-zA-Z0-9]+-)*[a-zA-Z0-9]+$/,
          '${label} only accepts alphanumeric connected by dash'
        )
        .lowercase()
        .label('Permalink')
        .test(
          'duplicatePermalinkValidation',
          '${label} value is already existed',
          duplicatePermalinkValidation
        ),
      flagIconAdd: isUpdate
        ? string()
            .defined()
            .default('')
            .label('Flag Icon')
            .when('flagIconDelete', {
              is: (value: string) => value !== '',
              then: string()
                .required()
                .test(
                  'flagIconFilePathValidation',
                  'Invalid ${label} file path',
                  flagIconFilePathValidation
                ),
              otherwise: string().defined(),
            })
        : string()
            .required()
            .label('Flag Icon')
            .test(
              'flagIconFilePathValidation',
              'Invalid ${label} file path',
              flagIconFilePathValidation
            ),
      flagIconDelete: isUpdate
        ? string().defined().default('').label('Flag Icon')
        : string().label('Flag Icon'),
    }),
  });

export const teamFileValidationSchema: SchemaOf<ITeamFileForm> = object({
  body: object({
    //it's a workaround https://github.com/jquense/yup/pull/1358/files
    flagIcon: mixed<Express.Multer.File>()
      .required()
      .label('Flag Icon')
      .test(flagIconFileUploadValidation),
  }),
});
