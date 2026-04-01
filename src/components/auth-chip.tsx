interface AuthChipProps {
  label: string;
  mode: "mock" | "live";
  showSignOut?: boolean;
}

export function AuthChip({ label, mode, showSignOut = false }: AuthChipProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
          mode === "live"
            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border border-slate-200 bg-slate-50 text-slate-600"
        }`}
      >
        {label}
      </div>
      {showSignOut ? (
        <form action="/auth/sign-out" method="post">
          <button
            type="submit"
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
          >
            Sign out
          </button>
        </form>
      ) : null}
    </div>
  );
}
