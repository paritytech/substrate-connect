import React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Code, Download, Globe, Home, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"

type NavItemName = "home" | "networks" | "add" | "import" | "debug"

const navItems = [
  { name: "home", icon: Home, to: "/accounts" },
  {
    name: "networks",
    icon: Globe,
    to: "/networks",
  },
  { name: "add", icon: Plus, to: "/accounts/add" },
  {
    name: "import",
    icon: Download,
    to: "/accounts/import",
  },
  {
    name: "debug",
    icon: Code,
    to: "/debug",
  },
] as const

export type BottomNavBarProps = {
  className?: string
  currentItem: NavItemName
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  className,
  currentItem,
}) => {
  const navigate = useNavigate()

  return (
    <nav className={cn("p-4 bg-foreground", className)}>
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            onClick={() => navigate(item.to)}
            className={cn(
              "flex flex-col items-center space-y-1 hover:bg-muted-foreground",
              currentItem === item.name
                ? "text-primary hover:text-primary"
                : "text-secondary hover:text-accent",
            )}
          >
            <item.icon className="w-6 h-6 min-h-6" />
            <span className="text-xs font-medium capitalize">{item.name}</span>
          </Button>
        ))}
      </div>
    </nav>
  )
}
