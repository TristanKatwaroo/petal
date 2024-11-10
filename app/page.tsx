// "use client";

// import { AppSidebar } from "@/components/app-sidebar";
// import NearbyStops from "@/components/NearbyStops";
// import FunStuffs from "@/components/fun-stuffs";
// import { Separator } from "@/components/ui/separator";
// import {
//   SidebarInset,
//   SidebarProvider,
//   SidebarTrigger,
// } from "@/components/ui/sidebar";

// export default function Home() {
//   return (
//     <div className="relative flex min-h-svh flex-1 flex-col bg-background">
//       <NearbyStops />
//       <div className="flex flex-1 flex-col gap-4 p-4">
//         <div className="grid auto-rows-min gap-4 md:grid-cols-3 bg-[url('/images/background.png')] bg-cover bg-center">
//           <h1 className="absolute top-[20rem] left-[25rem] text-3xl w-[45rem]">
//             Patal (Your Best adventure guide)
//           </h1>
//         </div>
//         {/* <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" /> */}
//       </div>
//       <FunStuffs />
//     </div>
//   );
// }

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
      <NearbyStops />
      <div className="relative bg-[url('/images/background.png')] bg-cover bg-center h-[15rem] mt-8 mb-5 rounded-2xl w-[75vw] ml-8">
        {/* <div className="absolute inset-0 bg-white/50 z-[-1]"></div> */}
        <h1 className="text-3xl text-black dark:text-black w-[100%] text-center mt-[7rem] font-extrabold">
          Your Best Adventure Guide
        </h1>
      </div>
      <NearbyThings />
    </div>
  );
}
