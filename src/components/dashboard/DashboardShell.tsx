"use client";

import { useState } from "react";
import { Sidebar, MobileSidebar } from "@/components/dashboard/Sidebar";
import { AiAssistantPanel } from "@/components/dashboard/AiAssistantPanel";

interface DashboardShellProps {
  children: React.ReactNode;
}

/** Dashboard shell with sidebar, mobile nav, and AI assistant panel. */
export function DashboardShell({ children }: DashboardShellProps) {
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar onOpenAssistant={() => setAssistantOpen(true)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileSidebar onOpenAssistant={() => setAssistantOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <AiAssistantPanel
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
      />
    </div>
  );
}
