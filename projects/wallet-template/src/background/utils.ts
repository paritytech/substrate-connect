export function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition || condition === false) throw new Error(msg)
}
