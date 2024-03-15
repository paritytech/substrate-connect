export type Network = {
  chainId: string
  label: string
  value: string
  logo: string
}

export const networks: Network[] = [
  {
    chainId:
      "0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3",
    value: "polkadot",
    label: "Polkadot",
    logo: "https://cryptologos.cc/logos/polkadot-new-dot-logo.svg",
  },
  {
    chainId:
      "0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e",
    value: "westend2",
    label: "Westend",
    logo: "https://i.imgur.com/Dwb1yMS.png",
  },
  {
    chainId:
      "0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe",
    value: "ksmcc3",
    label: "Kusama",
    logo: "https://cryptologos.cc/logos/kusama-ksm-logo.svg",
  },
]
