import { format } from 'util';
import { StageType } from '../types/global';
import constants from '../configs/constants';
import validationLocaleEn from '../configs/locale/validation.en';

export const validatePermalinkPattern = (permalink: string): boolean =>
  constants.PERMALINK_VALIDATION_PATTERN.test(permalink);

export const validateStageType = (type: StageType | null): boolean => {
  if (type === null) return true;
  return Object.values(StageType).includes(type);
};

export const isStageTypeRoundRobin = (type: StageType | null): boolean =>
  type === StageType.RoundRobin;

export const isStageTypeSingle = (type: StageType | null): boolean =>
  type === StageType.SingleElimination;

export const isStageTypeDouble = (type: StageType | null): boolean =>
  type === StageType.DoubleElimination;

export const getStageTypeValidationMessage = (label: string): string => {
  const allowedStageTypeStr = Object.keys(StageType)
    .filter(k => isNaN(Number(k)))
    .join(', ');

  return format(
    validationLocaleEn.validationMessage.notAllowStageType,
    label,
    allowedStageTypeStr
  );
};
