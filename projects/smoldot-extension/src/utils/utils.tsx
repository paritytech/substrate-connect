export const capitalizeFirstLetter = (val: string): string => val[0].toUpperCase() + val.slice(1);

export const isEmpty = (obj: any): boolean => (Object.keys(obj).length === 0 && obj.constructor === Object)
