import React from "react"

import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

export type HeaderProps = {
  className?: string
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header
      className={cn(
        "flex items-center justify-between pt-6 pb-4 bg-foreground",
        "px-6 sm:px-8",
        "text-primary-foreground",
        className,
      )}
    >
      <div className="text-2xl font-semibold leading-4">
        substrate
        <span className="text-primary">_</span>
        <br />
        <span className="text-4xl text-primary">connect</span>
      </div>
      <Link
        data-testid="btnGoToOptions"
        to="/options"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button type="button" variant="ghost">
          <Settings className="w-6 h-6" />
        </Button>
      </Link>
    </header>
  )
}
