import joi, { ValidationOptions } from 'joi';
export interface ITeamFieldForm {
  name: string;
  permalink: string;
}

export interface ITeamFileForm {
  flagIcon: Express.Multer.File;
}

// TODO: leverage validation with label
// TODO: leverage validation with languages
// (message function - https://github.com/sideway/joi/blob/83092836583a7f4ce16cbf116b8776737e80d16f/test/base.js#L1920)
export const teamFieldValidationSchema = joi.object<ITeamFieldForm, true>({
  name: joi.string().required().label('Name'),
  permalink: joi
    .string()
    .required()
    .pattern(/^([a-zA-Z0-9]+-)*[a-zA-Z0-9]+$/),
});

export const teamFileValidationSchema = joi.object<ITeamFileForm, true>({
  flagIcon: joi.object().required(),
});

export const options: ValidationOptions = {
  abortEarly: false,
  allowUnknown: true,
};
