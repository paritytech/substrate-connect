import React, { FunctionComponent } from "react"
import "../main.css"

interface Props {
  size?: string
  color?: string
  children?: string
}

const hasGlyph = (string: string) =>
  ["kusama", "polkadot", "westend", "rococo"].indexOf(string) > -1

const IconWeb3: FunctionComponent<Props> = ({ size, color, children }) => {
  return (
    <span className="icon text-xl w-10">
      {children && hasGlyph(children) ? children : "?"}
    </span>
  )
}

export default IconWeb3
