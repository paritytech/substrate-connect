import React from "react"
import { MenuItemContent } from "./MenuItemContent"

interface MenuContentProps {
  activeMenu: number
  children: React.ReactNode
}

export const MenuContent = ({ activeMenu = 0, children }: MenuContentProps) => (
  <div className="relative flex flex-col w-full min-w-0 mb-6 break-words rounded">
    <div className="flex-auto px-4 py-5">
      <div className="tab-content tab-space">
        {React.Children.map(
          children,
          (c, i) => activeMenu === i && <MenuItemContent child={c} index={i} />,
        )}
      </div>
    </div>
  </div>
)
