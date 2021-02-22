export const capitalizeFirstLetter = (val: string): string => val[0].toUpperCase() + val.slice(1);

export const isEmpty = (obj: unknown): boolean => ((typeof obj === 'object' && obj !== null) && Object.keys(obj).length === 0 && obj.constructor === Object)
