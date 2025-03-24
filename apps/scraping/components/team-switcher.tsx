"use client"

import * as React from "react"
import Image from 'next/image'
import { useTheme } from "next-themes"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"

export function TeamSwitcher({ teams }: { teams: { name: string; plan: string }[] }) {
  const { theme } = useTheme()
  const team = teams[0]!
  const avatar = theme === "dark" ? "/static/logo-dark.png" : "/static/logo-light.png"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="cursor-default">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
            <Image src={avatar} alt={`${team.name} logo`} className="size-full object-cover" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{team.name}</span>
            <span className="truncate text-xs text-muted-foreground">{team.plan}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
