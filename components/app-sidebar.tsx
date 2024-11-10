"use client";

import * as React from "react";
import { usePathname } from "next/navigation"; // Import usePathname from next/navigation
import { Home, Map, BotMessageSquare, Settings, Calendar } from "lucide-react"; // Import icons

import { SearchForm } from "@/components/search-form";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ModeToggle } from "./ModeToggle";
import Link from "next/link";

const data = {
  navMain: [
    {
      url: "#",
      items: [
        {
          title: "Home",
          url: "/",
          icon: <Home className="mr-1" />,
        },
        {
          title: "Events",
          url: "/events",
          icon: <Calendar className="mr-1" />,
        },
        {
          title: "Navigate",
          url: "/navigate",
          icon: <Map className="mr-1" />,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname(); // Use usePathname to get the current path

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        {/* <h1 className="pt-3 pb-1 px-3">*App Logo*</h1> */}
        <div className="flex item-center gap-y-40">
          <Image
            src="/images/leaf.png"
            alt="App Logo"
            width={60} // Adjust width as needed
            height={60} // Adjust height as needed
            className="pt-3 pb-1 px-3" // Add any additional styling if needed
          />
          <h1 className="pt-5">Petal</h1>
        </div>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent className="px-3">
        {data.navMain.map((section) => (
          <SidebarMenu key={section.url}>
            {section.items.map((item) => {
              const isActive = pathname === item.url; // Compare with the current path
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:text-blue-500">
                    <Link
                      href={item.url}
                      className={cn(
                        "px-3 py-2 flex items-center",
                        isActive ? "text-blue-500 font-bold" : ""
                      )}
                    >
                      {item.icon}
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
            <ModeToggle />
          </SidebarMenu>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
