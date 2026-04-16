"use client";

import * as React from "react";
import {
  IconChartBar,
  IconDatabase,
  IconHelp,
  IconListDetails,
  IconSearch,
  IconSettings,
  IconUsers,
  IconShoppingCart,
  IconTruckDelivery,
  IconTools,
} from "@tabler/icons-react";
import { LogOutIcon } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { toast } from "sonner";

const data = {
  user: {
    name: "Customer",
    email: "customer@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Order Assignment",
      url: "/rider/order-assignment",
      icon: <IconTools />,
    },

    {
      title: "Delivery Tracking",
      url: "/rider/delivery-tracking",
      icon: <IconTruckDelivery />,
    },
    {
      title: "Delivery History",
      url: "/rider/delivery-history",
      icon: <IconUsers />,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: <IconSettings />,
    },
    {
      title: "Get Help",
      url: "#",
      icon: <IconHelp />,
    },
    {
      title: "Search",
      url: "#",
      icon: <IconSearch />,
    },
  ],
};

export function AppSidebarRider({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <IconShoppingCart className="size-4" />
                </div>
                <span className="text-base font-semibold">
                  Food Ordering System
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => {
              toast.success("Logged out successfully!")
            }}
          >
            <LogOutIcon className="size-4" />
            Log out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
