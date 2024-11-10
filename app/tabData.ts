export const data = {
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

// A helper function to find the active tab title based on the current pathname
export function getActiveTabTitle(pathname: string) {
  const activeTab = data.navMain
    .flatMap((section) => section.items)
    .find((item) => item.url === pathname);

  return activeTab ? activeTab.title : "No Active Tab";
}
