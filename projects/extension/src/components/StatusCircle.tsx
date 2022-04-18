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
      ? "1"
      : size === "medium"
      ? "2"
      : size === "large"
      ? "3"
      : "1"
  const r =
    size === "small"
      ? "lg"
      : size === "medium"
      ? "xl"
      : size === "large"
      ? "2xl"
      : "base"

  const cl = "w-" + s + " h-" + s + " rounded-" + r
  return (
    <div
      data-testid="circle"
      className={cl}
      style={{
        backgroundColor: `${color || substrateGreen[400]}`,
        border: `1px solid ${borderColor || substrateGreen[400]}`,
      }}
    />
  )
}

export default StatusCircle
