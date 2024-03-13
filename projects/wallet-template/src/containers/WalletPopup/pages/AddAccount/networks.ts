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
]
