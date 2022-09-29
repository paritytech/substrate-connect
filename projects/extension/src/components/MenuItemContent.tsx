import React from "react"

interface MenuItemContentProps {
  index: number
  child: React.ReactNode
}

export const MenuItemContent = ({ child, index }: MenuItemContentProps) => (
  <div className={"block"} id={`"${"link".concat(index.toString())}"`}>
    {child}
  </div>
)
