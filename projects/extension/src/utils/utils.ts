/**
 * 
 * @param val - any string
 * 
 * @returns same string with first letter of that string to be capitalized
 */
export const capitalizeFirstLetter = (val: string): string => val[0].toUpperCase() + val.slice(1);

export const isEmpty = (obj: Record<string, unknown>): boolean => obj && Object.keys(obj).length === 0 && obj.constructor === Object;
