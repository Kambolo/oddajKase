import { useState } from "react";

type Props = {
  name: string;
  members: string[];
  inviteCode?: string;
  onViewSummary: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function GroupCard({
  name,
  members,
  inviteCode,
  onViewSummary,
  onEdit,
  onDelete,
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onViewSummary}
      className="cursor-pointer group rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-sm transition hover:border-accent/60 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent/30"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm uppercase tracking-[0.24em] text-slate-500">
            Group
          </div>
          <h3 className="mt-2 text-xl font-semibold text-text">{name}</h3>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {members.map((member) => (
          <span
            key={member}
            className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
          >
            {member}
          </span>
        ))}
        {members.length === 0 && (
          <span className="text-xs text-slate-400 italic">No members yet</span>
        )}
      </div>

      {inviteCode && (
        <button
          type="button"
          onClick={handleCopyCode}
          className="cursor-pointer mt-5 flex w-full items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-slate-400">
              Invite code
            </span>
            <span className="font-mono text-base font-bold tracking-widest text-primary">
              {inviteCode}
            </span>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {copied ? "Copied!" : "Copy"}
          </span>
        </button>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="cursor-pointer inline-flex items-center justify-center rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          Delete group
        </button>
      </div>

      <div className="mt-4 rounded-3xl bg-slate-50 p-3 text-sm text-slate-500 transition group-hover:bg-slate-100">
        Click card to view full summary.
      </div>
    </div>
  );
}
