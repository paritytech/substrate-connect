const mapNameToId: Map<string, string> = new Map<string, string>([
  ["polkadot", "polkadot"],
  ["ksmcc3", "kusama"],
  ["rococo_v1_13", "rococo"],
  ["westend2", "westend"],
])

export async function getSpec(chain: string): Promise<string> {
  const specRaw = (await import(
    "./generated/" + mapNameToId.get(chain) + ".js"
  )) as string | { default: string }

  return typeof specRaw === "string"
    ? specRaw
    : (specRaw as unknown as { default: string }).default
}
