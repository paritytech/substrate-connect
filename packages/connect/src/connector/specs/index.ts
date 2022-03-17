export async function getSpec(chain: string): Promise<string> {
  // We don't want API users to be able to `import` a file outside of the `generated` directory.
  // While it is probably harmless, better be safe than sorry.
  // This is done by make sure that the name doesn't contain `..`. This also means that we can't
  // support well-known chain whose name contains `..`, but that seems unlikely to ever be
  // problematic.
  if (chain.indexOf("..") !== -1) throw new Error("Invalid chain name")

  try {
    const specRaw = (await import("./generated/" + chain + ".js")) as
      | string
      | { default: string }

    return typeof specRaw === "string"
      ? specRaw
      : (specRaw as unknown as { default: string }).default
  } catch (error) {
    throw new Error("Invalid chain name")
  }
}
