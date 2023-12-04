import React from "react"

type MenuContentProps = {
  children: React.ReactNode
}

export const MenuContent = ({ children }: MenuContentProps) => (
  <div className="relative flex flex-col w-full min-w-0 mb-6 break-words rounded">
    <div className="flex-auto px-4 py-5">
      <div className="tab-content tab-space">
        <div className="block">{children}</div>
      </div>
    </div>
  </div>
)
