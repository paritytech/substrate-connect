export const isEmpty = (obj: Record<string, unknown>): boolean =>
  obj && Object.keys(obj).length === 0 && obj.constructor === Object
