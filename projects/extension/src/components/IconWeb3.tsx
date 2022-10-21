import React, { FunctionComponent } from "react"
import "../main.css"

interface Props {
  children?: string
}

const hasGlyph = (string: string) =>
  [
    "kusama",
    "polkadot",
    "westend",
    "rococo",
    "astar",
    "shiden",
    "gm parachain",
  ].indexOf(string) > -1

export const IconWeb3: FunctionComponent<Props> = ({ children }) => {
  return (
    <span className="icon text-xl w-10">
      {children && hasGlyph(children) ? children : "?"}
    </span>
  )
}
