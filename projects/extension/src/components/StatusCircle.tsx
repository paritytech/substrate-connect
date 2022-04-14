import React, { FunctionComponent } from "react"
import { substrateGreen } from "./theme"

export interface Props {
  size?: "small" | "medium" | "large"
  color?: string
  borderColor?: string
}

const StatusCircle: FunctionComponent<Props> = ({
  size = "medium",
  color,
  borderColor,
}: Props) => {
  const s =
    size === "small"
      ? "1.5"
      : size === "medium"
      ? "2.5"
      : size === "large" && "3.5"
  const r =
    size === "small"
      ? "lg"
      : size === "medium"
      ? "xl"
      : size === "large" && "2xl"

  const styleObj = {
    border: `${color || substrateGreen[400]}`,
    backgroundColor: `"1px solid ${borderColor || substrateGreen[400]}"`,
  }
  const cName = `w-${s} h-${s} rounded-${r}`

  return <div data-testid="circle" className={cName} style={styleObj} />
}

export default StatusCircle
