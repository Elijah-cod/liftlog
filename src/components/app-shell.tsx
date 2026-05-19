import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  contentClassName?: string;
}

export function AppShell({ children, contentClassName }: AppShellProps) {
  return (
    <div className="min-h-screen px-3 py-4 text-slate-950 sm:px-6 sm:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl items-stretch justify-center sm:min-h-[calc(100vh-3rem)]">
        <div className="app-frame grid w-full max-w-[430px] grid-rows-[1fr] rounded-[32px] p-2.5 sm:rounded-[36px] sm:p-3 md:max-w-[920px] xl:max-w-[1180px] 2xl:max-w-[1280px]">
          <main
            className={cn(
              "hero-accent overflow-hidden rounded-[26px] sm:rounded-[28px]",
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
