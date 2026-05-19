interface AuthChipProps {
  label: string;
  mode: "mock" | "live";
  showSignOut?: boolean;
}

export function AuthChip({ label, mode, showSignOut = false }: AuthChipProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className={`max-w-full rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] shadow-sm ${
          mode === "live"
            ? "border border-emerald-200 bg-[linear-gradient(135deg,#ecfdf5,#d1fae5)] text-emerald-700"
            : "border border-sky-200 bg-[linear-gradient(135deg,#f0f9ff,#dbeafe)] text-sky-700"
        }`}
      >
        {label}
      </div>
      {showSignOut ? (
        <form action="/auth/sign-out" method="post">
          <button
            type="submit"
            className="interactive-lift rounded-full border border-white/70 bg-[linear-gradient(135deg,#ffffff,#f8fafc)] px-3 py-2 text-[11px] font-semibold text-slate-700 shadow-sm"
          >
            Sign out
          </button>
        </form>
      ) : null}
    </div>
  );
}
