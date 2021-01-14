export const COMBINED_TEXTURE_KEY = '@@combined';
const COMBINED_TEXTURE_PREFIX = COMBINED_TEXTURE_KEY + ':';

export const getCombinedKey = key => `${COMBINED_TEXTURE_PREFIX}${key}`;
export const extractKey = combinedKey => combinedKey.substring(COMBINED_TEXTURE_PREFIX.length);
