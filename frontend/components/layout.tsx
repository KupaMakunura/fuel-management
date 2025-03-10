import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 items-center gap-4 border-b bg-white px-6 dark:bg-neutral-950">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">Fuel Management Dashboard</h1>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

