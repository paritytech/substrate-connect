/*
 * Prints a debug message to the console when running in local development
 * mode.
 *
 * @param message - a descriptive message to print
 * @param ctx - an object to log out to the console
 */
export function debug(message: string, ctx: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.debug(message, ctx);
  }
}
