// src/components/ActiveTabTitle.tsx

'use client';

import { usePathname } from 'next/navigation';

// Data structure for navigation items
const data = {
  navMain: [
    {
      url: "/",
      items: [
        { title: "Home", url: "/" },
        { title: "Navigate", url: "/navigate" },
        { title: "Chat", url: "/chat" },
        { title: "Store", url: "/store" },
        { title: "Settings", url: "/settings" },
      ],
    },
  ],
};

export function ActiveTabTitle() {
  const pathname = usePathname(); // Get the current path
  
  // Find the active tab based on the pathname
  const activeTab = data.navMain
    .flatMap((section) => section.items)
    .find((item) => item.url === pathname);

  const activeTabTitle = activeTab ? activeTab.title : "No Active Tab";

  return <h2>{activeTabTitle}</h2>;
}
