import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  contentClassName?: string;
}

export function AppShell({ children, contentClassName }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#eff7ff,transparent_38%),linear-gradient(180deg,#f8fbff_0%,#eef3f8_100%)] px-3 py-4 text-slate-950 sm:px-6 sm:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl items-stretch justify-center sm:min-h-[calc(100vh-3rem)]">
        <div className="grid w-full max-w-[430px] grid-rows-[1fr] rounded-[32px] border border-white/80 bg-white/80 p-2.5 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur sm:rounded-[36px] sm:p-3 md:max-w-[880px] xl:max-w-[1160px] 2xl:max-w-[1260px]">
          <main
            className={cn(
              "overflow-hidden rounded-[26px] bg-[linear-gradient(180deg,#ffffff_0%,#f4f7fb_100%)] sm:rounded-[28px]",
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
