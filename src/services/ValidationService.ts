export const validatePermalinkPattern = function (permalink: string) {
  return /^([a-zA-Z0-9]+-)*[a-zA-Z0-9]+$/.test(permalink);
};
