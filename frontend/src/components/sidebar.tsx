import type { ReactNode } from "react"

interface SidebarProps {
  children: ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  return <div className="h-full flex flex-col border-r bg-background">{children}</div>
}

