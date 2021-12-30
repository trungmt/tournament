import { StageType } from '../types/global';

export const validatePermalinkPattern = (permalink: string): boolean =>
  /^([a-zA-Z0-9]+-)*[a-zA-Z0-9]+$/.test(permalink);

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
  return `${label} have to be one of these types: ${Object.keys(StageType)
    .filter(k => isNaN(Number(k)))
    .join(', ')}`;
};
