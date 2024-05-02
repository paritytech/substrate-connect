import React from "react"

export type Props = {
  children?: React.ReactNode
}

export const Layout: React.FC<Props> = ({ children }) => {
  return <div className="w-[32rem] mx-auto px-6 py-8">{children}</div>
}
