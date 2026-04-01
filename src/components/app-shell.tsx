import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  contentClassName?: string;
}

export function AppShell({ children, contentClassName }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#eff7ff,transparent_38%),linear-gradient(180deg,#f8fbff_0%,#eef3f8_100%)] px-4 py-6 text-slate-950 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-stretch justify-center">
        <div className="grid w-full max-w-[430px] grid-rows-[1fr] rounded-[36px] border border-white/70 bg-white/80 p-3 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <main
            className={cn(
              "overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#ffffff_0%,#f4f7fb_100%)]",
              contentClassName,
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

