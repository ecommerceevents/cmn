"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTheme } from "@/components/theme-provider"
import { Moon, Sun, LayoutDashboard, Upload, Search, Building2, Users, Settings, Database } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "Data Upload",
    icon: Upload,
    href: "/upload",
  },
  {
    label: "Keywords",
    icon: Search,
    href: "/keywords",
  },
  {
    label: "Companies",
    icon: Building2,
    href: "/companies",
  },
  {
    label: "Contacts",
    icon: Users,
    href: "/contacts",
  },
  {
    label: "API Settings",
    icon: Settings,
    href: "/settings",
  },
  {
    label: "Database",
    icon: Database,
    href: "/database",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-muted/50 border-r">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">
          Capital Markets Network
        </h2>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                pathname === route.href ? "text-primary bg-primary/10" : "text-muted-foreground"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className="h-5 w-5 mr-3" />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-auto px-3">
        <Button
          variant="ghost"
          size="icon"
          className="w-full justify-start"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="ml-4">{theme === "light" ? "Dark" : "Light"} Mode</span>
        </Button>
      </div>
    </div>
  )
}