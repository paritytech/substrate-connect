import { ReactNode } from "react"

interface MenuItemContentProps {
  index: number
  child: ReactNode
}

export const MenuItemContent = ({ child, index }: MenuItemContentProps) => (
  <div className={"block"} id={`"${"link".concat(index.toString())}"`}>
    {child}
  </div>
)
