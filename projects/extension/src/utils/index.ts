/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/**
 * 
 * @param val any string
 * @returns same string with first letter of that string to be capitalized
 */
export const capitalizeFirstLetter = (val: string): string => val[0].toUpperCase() + val.slice(1);

/*
 * Prints a debug message to the console when running in local development
 * mode.
 *
 * @param message - a descriptive message to print
 * @param ctx - an optional object to log out to the console
 */
export const debug = (message: string, ctx?: unknown): void => {
  (process.env.NODE_ENV === 'development' && ctx)
  ?  console.debug(message, ctx)
  : console.debug(message)
}
