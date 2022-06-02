import React, { FunctionComponent } from "react"
interface Props {
  size?: string
  color?: string
  children?: string
}

import "../main.css"

const hasGlyph = (string: string) =>
  ["kusama", "polkadot", "westend", "kulupu", "rococo"].indexOf(string) > -1

const IconWeb3: FunctionComponent<Props> = ({ size, color, children }) => {
  return (
    <span className="icon text-xl w-10">
      {children && hasGlyph(children) ? children : "?"}
    </span>
  )
}

export default IconWeb3
