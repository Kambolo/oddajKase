import Modal from "../common/Modal";

type Contact = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  open: boolean;
  groupName: string;
  balance: string;
  contacts: Contact[];
  memberBalances: Record<string, number>;
  onClose: () => void;
};

export default function GroupSummaryModal({
  open,
  groupName,
  balance,
  contacts,
  memberBalances,
  onClose,
}: Props) {
  return (
    <Modal open={open} title={`${groupName} summary`} onClose={onClose}>
      <div className="space-y-6">
        <div className="rounded-3xl bg-slate-50 p-4 text-slate-800">
          <div className="text-sm text-slate-500">Group balance</div>
          <div className="mt-2 text-3xl font-semibold text-text">{balance}</div>
        </div>
        <div className="space-y-4">
          {Object.entries(memberBalances).map(([memberId, amount]) => {
            const contact = contacts.find((item) => item.id === memberId);
            if (!contact) return null;
            const isNegative = amount < 0;
            const formatted = `${isNegative ? "-" : "+"}€${Math.abs(amount).toFixed(2)}`;
            return (
              <div
                key={memberId}
                className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4"
              >
                <div>
                  <div className="font-semibold text-text">{contact.name}</div>
                  <div className="text-sm text-slate-500">{contact.email}</div>
                </div>
                <div className={`font-semibold ${isNegative ? "text-rose-500" : "text-emerald-500"}`}>
                  {formatted}
                </div>
              </div>
            );
          })}
        </div>
        <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
          <strong>Note:</strong> Negative values mean you owe the person; positive values mean they owe you.
        </div>
      </div>
    </Modal>
  );
}
