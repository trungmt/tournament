import path from 'path';
import { access } from 'fs/promises';
import joi, {
  CustomValidator,
  ExternalValidationFunction,
  ValidationOptions,
} from 'joi';
import Joi from 'joi';

export interface ITeamFieldForm {
  name: string;
  permalink: string;
  flagIcon: string;
}

export interface ITeamFileForm {
  flagIcon: Express.Multer.File;
}

const flagIconFilePathValidation: ExternalValidationFunction = async value => {
  const tempFilePath = path.join(
    process.env.UPLOAD_TEMP_FILE_DIR!,
    'teams',
    value
  );

  try {
    await access(tempFilePath);
  } catch (error) {
    throw new Joi.ValidationError(
      'Invalid Flag Icon file path',
      [
        {
          message: 'Invalid Flag Icon file path',
          path: ['flagIcon'],
          type: 'any.external',
          context: {
            key: 'flagIcon',
            label: 'Flag Icon',
            value,
          },
        },
      ],
      value
    );
  }
  return value;
};

// NOTE:(message function - https://github.com/sideway/joi/blob/83092836583a7f4ce16cbf116b8776737e80d16f/test/base.js#L1920)
export const teamFieldValidationSchema = joi.object<ITeamFieldForm, true>({
  name: joi.string().required().label('Name'),
  permalink: joi
    .string()
    .required()
    .pattern(/^([a-zA-Z0-9]+-)*[a-zA-Z0-9]+$/)
    .label('Permalink'),
  flagIcon: joi
    .string()
    .required()
    .label('Flag Icon')
    .external(flagIconFilePathValidation),
});

export const teamFileValidationSchema = joi.object<ITeamFileForm, true>({
  flagIcon: joi.object().required().label('Flag Icon'),
});
