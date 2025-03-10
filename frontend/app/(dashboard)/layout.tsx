"use client";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 w-full">
          <header className="flex h-16 items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">
              National Fuel Management System
            </h1>
          </header>
          <main className="flex-1 overflow-auto p-6 w-full">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
