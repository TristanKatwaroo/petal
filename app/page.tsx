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
import NearbyThings from "@/components/NearbyThings";

export default function Home() {
  return (
    <div className="relative flex min-h-svh flex-1 flex-col bg-background">
      <div className="relative bg-[url('/images/background.png')] bg-cover bg-center h-[15rem] mb-5 w-full shadow-lg shadow-gray-500/50">
        {/* <div className="absolute inset-0 bg-white/50 z-[-1]"></div> */}
        <h1 className="text-5xl font-lexend text-black dark:text-black w-[100%] text-center mt-[6rem] font-extrabold">
          Your Best Adventure Guide
        </h1>
      </div>
      <NearbyStops />
      <NearbyThings />
    </div>
  );
}
