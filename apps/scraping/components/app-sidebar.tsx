"use client"

import * as React from "react"
import {
  SquareTerminal,
  LayoutDashboard,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar"

const data = {
  teams: [
    {
      name: "Luxehouze",
      plan: "Web Scraping",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard/overview",
      icon: LayoutDashboard,
    },
    {
      title: "Price Calculation Settings",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Brand",
          url: "/dashboard/lookup-price/brand",
        },
        {
          title: "Reference Number",
          url: "/dashboard/lookup-price/ref-number",
        },
        {
          title: "Bracelet",
          url: "/dashboard/lookup-price/bracelet",
        },
        {
          title: "Coefficients",
          url: "/dashboard/lookup-price/coefficients",
        },
        {
          title: "SWU Type",
          url: "/dashboard/lookup-price/swu-type",
        },
        {
          title: "Dial",
          url: "/dashboard/lookup-price/dial",
        },
        {
          title: "Condition",
          url: "/dashboard/lookup-price/condition",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}