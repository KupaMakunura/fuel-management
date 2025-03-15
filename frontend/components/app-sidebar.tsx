"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { BarChart3, Droplet, FileText, Package, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const menuItems = [
  { name: "Overview", icon: BarChart3, href: "/overview" },
  { name: "Tanks", icon: Droplet, href: "/tanks" },
  { name: "Inventory", icon: Package, href: "/inventory" },
  { name: "Predictions", icon: Package, href: "/predictions" },
  { name: "Reports", icon: FileText, href: "/reports" },
  { name: "Admin Settings", icon: Settings, href: "/admin" },
];

export function AppSidebar() {
  const handleLogout = async () => {
    await signOut();
  };
  return (
    <Sidebar className="">
      <SidebarHeader>
        <h2 className="text-lg font-semibold px-4 py-2">NOIC</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-5">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild>
                <Link href={item.href} className="text-lg font-semibold">
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Button
          onClick={() => handleLogout()}
          className="bg-primary hover:bg-primary/90"
        >
          <LogOut />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
