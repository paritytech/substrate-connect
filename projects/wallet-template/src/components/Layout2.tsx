import React from "react"

import { cn } from "@/lib/utils"

export type Props = {
  children?: React.ReactNode
}

/**
 * This Layout is the new layout but is called Layout2 until all pages
 * are migrated to the new layout.
 */
export const Layout2: React.FC<Props> = ({ children }) => {
  return (
    <main
      className={cn(
        "flex items-center justify-center",
        "min-w-[400px] min-h-screen",
        "bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600",
        "font-sans",
      )}
    >
      <div className={cn("flex", "min-h-[600px]", "lg:px-8 lg:py-12")}>
        {children}
      </div>
    </main>
  )
}
