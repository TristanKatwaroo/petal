"use client";

import { AppSidebar } from "@/components/app-sidebar";
import NearbyStops from "@/components/NearbyStops";
import FunStuffs from "@/components/fun-stuffs";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Home() {
  return (
    <div className="relative flex min-h-svh flex-1 flex-col bg-background">
      <NearbyStops />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        {/* <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" /> */}
        <FunStuffs />
      </div>
    </div>
  );
}
