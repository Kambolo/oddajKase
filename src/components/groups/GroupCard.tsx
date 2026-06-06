type Props = {
  name: string;
  amount: string;
  members: string[];
  onViewSummary: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function GroupCard({ name, amount, members, onViewSummary, onEdit, onDelete }: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onViewSummary}
      className="group rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-sm transition hover:border-accent/60 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent/30"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Group</div>
          <h3 className="mt-2 text-xl font-semibold text-text">{name}</h3>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500">Balance</div>
          <div className="mt-1 text-2xl font-bold text-text">{amount}</div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {members.map((member) => (
          <span key={member} className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {member}
          </span>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Edit members
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="inline-flex items-center justify-center rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
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
