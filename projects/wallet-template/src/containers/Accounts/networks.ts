export type Network = {
  label: string
  value: string
  logo: string
}

export const networks: Network[] = [
  {
    value: "polkadot",
    label: "Polkadot",
    logo: "https://cryptologos.cc/logos/polkadot-new-dot-logo.svg",
  },
  {
    value: "westend2",
    label: "Westend",
    logo: "https://i.imgur.com/Dwb1yMS.png",
  },
  {
    value: "ksmcc3",
    label: "Kusama",
    logo: "https://cryptologos.cc/logos/kusama-ksm-logo.svg",
  },
  {
    value: "polkadot_asset_hub",
    label: "Polkadot Asset Hub",
    logo: "https://i.imgur.com/Vu3xpq2.png",
  },
  {
    value: "westend_asset_hub",
    label: "Westend Asset Hub",
    logo: "https://i.imgur.com/RkU4UQQ.png",
  },
  {
    value: "kusama_asset_hub",
    label: "Kusama Asset Hub",
    logo: "https://i.imgur.com/Q1bH3U9.png",
  },
]
