import type { MouseEventHandler } from "react";

export default function DashboardHeader({
  title = "Dashboard",
  onNewExpense,
}: {
  title?: string;
  onNewExpense: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[32px] border border-white/30 bg-white/5 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-text">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-text/70">
          Here is your personal finance dashboard. Track income, expenses and recent activity at a glance.
        </p>
      </div>
      <button
        type="button"
        onClick={onNewExpense}
        className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
      >
        + New expense
      </button>
    </div>
  );
}
