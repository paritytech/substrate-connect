import React from "react"

import { cn } from "@/lib/utils"

export type Props = {
  className?: string
  children?: React.ReactNode
}

/**
 * This Layout is the new layout but is called Layout2 until all pages
 * are migrated to the new layout.
 */
export const Layout2: React.FC<Props> = ({ children, className }) => {
  return (
    <main
      className={cn(
        "flex items-center justify-center",
        "min-h-screen",
        "bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600",
        "font-sans",
        className,
      )}
    >
      <div
        className={cn(
          "bg-background",
          "w-[400px] h-[600px]",
          "flex flex-col",
          "shadow-sm",
          "rounded-none lg:rounded",
        )}
      >
        {children}
      </div>
    </main>
  )
}
