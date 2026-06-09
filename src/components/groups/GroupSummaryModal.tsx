import { useState } from "react";
import type { GroupExpense, GroupPayment } from "../../lib/types";
import Modal from "../common/Modal";

type Contact = {
  id: string;
  name: string;
  email: string;
};

type Tab = "balances" | "expenses" | "payments" | "settlements";

type Props = {
  open: boolean;
  groupName: string;
  balance: string;
  contacts: Contact[];
  memberBalances: Record<string, number>;
  expenses: GroupExpense[];
  payments: GroupPayment[];
  onClose: () => void;
};

function resolveName(id: string, contacts: Contact[]): string {
  if (id === "me") return "You";
  return contacts.find((c) => c.id === id)?.name ?? id;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Compute minimal settlement instructions from memberBalances
function computeSettlements(
  memberBalances: Record<string, number>,
  contacts: Contact[],
): { from: string; to: string; amount: number }[] {
  const debtors = Object.entries(memberBalances)
    .filter(([, v]) => v < 0)
    .map(([id, v]) => ({ id, amount: -v }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = Object.entries(memberBalances)
    .filter(([, v]) => v > 0)
    .map(([id, v]) => ({ id, amount: v }))
    .sort((a, b) => b.amount - a.amount);

  const result: { from: string; to: string; amount: number }[] = [];
  let di = 0;
  let ci = 0;

  while (di < debtors.length && ci < creditors.length) {
    const settle = Math.min(debtors[di].amount, creditors[ci].amount);
    result.push({
      from: resolveName(debtors[di].id, contacts),
      to: resolveName(creditors[ci].id, contacts),
      amount: settle,
    });
    debtors[di].amount -= settle;
    creditors[ci].amount -= settle;
    if (debtors[di].amount < 0.01) di++;
    if (creditors[ci].amount < 0.01) ci++;
  }

  return result;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "balances", label: "Balances" },
  { id: "expenses", label: "Expenses" },
  { id: "payments", label: "Payments" },
  { id: "settlements", label: "Settle up" },
];

export default function GroupSummaryModal({
  open,
  groupName,
  balance,
  contacts,
  memberBalances,
  expenses,
  payments,
  onClose,
}: Props) {
  const [tab, setTab] = useState<Tab>("balances");

  const settlements = computeSettlements(memberBalances, contacts);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalPayments = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <Modal open={open} title={`${groupName}`} onClose={onClose}>
      <div className="space-y-5">
        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-center">
            <div className="text-xs text-slate-400 uppercase tracking-wide">
              Balance
            </div>
            <div className="mt-1 text-lg font-bold text-text">{balance}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-center">
            <div className="text-xs text-slate-400 uppercase tracking-wide">
              Spent
            </div>
            <div className="mt-1 text-lg font-bold text-text">
              €{totalExpenses.toFixed(2)}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-center">
            <div className="text-xs text-slate-400 uppercase tracking-wide">
              Settled
            </div>
            <div className="mt-1 text-lg font-bold text-emerald-600">
              €{totalPayments.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 rounded-2xl bg-slate-100 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all ${
                tab === t.id
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Balances */}
        {tab === "balances" && (
          <div className="space-y-2">
            {Object.entries(memberBalances).length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">
                No members yet.
              </p>
            )}
            {Object.entries(memberBalances).map(([memberId, amount]) => {
              const name = resolveName(memberId, contacts);
              const contact = contacts.find((c) => c.id === memberId);
              const isNeg = amount < 0;
              return (
                <div
                  key={memberId}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div>
                    <div className="font-semibold text-slate-800">{name}</div>
                    {contact && (
                      <div className="text-xs text-slate-400">
                        {contact.email}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-bold ${isNeg ? "text-rose-500" : amount === 0 ? "text-slate-400" : "text-emerald-600"}`}
                    >
                      {isNeg ? "-" : "+"}€{Math.abs(amount).toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {isNeg ? "owes" : amount === 0 ? "settled" : "is owed"}
                    </div>
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-slate-400 pt-1 text-center">
              Negative = owes money · Positive = is owed money
            </p>
          </div>
        )}

        {/* Tab: Expenses */}
        {tab === "expenses" && (
          <div className="space-y-2">
            {expenses.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">
                No expenses recorded.
              </p>
            )}
            {expenses.map((exp) => {
              const paidByName = resolveName(exp.paidBy, contacts);
              const perPerson = exp.amount / exp.splitBetween.length;
              return (
                <div
                  key={exp.id}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 truncate">
                        {exp.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Paid by {paidByName} · {formatDate(exp.date)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-slate-800">
                        €{exp.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-400">
                        €{perPerson.toFixed(2)}/person
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {exp.splitBetween.map((id) => (
                      <span
                        key={id}
                        className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600"
                      >
                        {resolveName(id, contacts)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab: Payments */}
        {tab === "payments" && (
          <div className="space-y-2">
            {payments.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">
                No payments recorded.
              </p>
            )}
            {payments.map((pay) => (
              <div
                key={pay.id}
                className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3"
              >
                <div>
                  <div className="font-semibold text-slate-800 text-sm">
                    {resolveName(pay.from, contacts)}{" "}
                    <span className="text-slate-400 font-normal">→</span>{" "}
                    {resolveName(pay.to, contacts)}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {formatDate(pay.date)}
                  </div>
                </div>
                <div className="font-bold text-emerald-600">
                  €{pay.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Settle up */}
        {tab === "settlements" && (
          <div className="space-y-3">
            {settlements.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <div className="text-3xl">🎉</div>
                <div className="font-semibold text-slate-700">
                  All settled up!
                </div>
                <div className="text-sm text-slate-400">
                  Everyone in this group is even.
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-500">
                  Minimum transactions to settle all debts:
                </p>
                {settlements.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <div className="text-sm text-slate-700">
                      <span className="font-semibold text-rose-600">
                        {s.from}
                      </span>
                      <span className="mx-2 text-slate-400">pays</span>
                      <span className="font-semibold text-emerald-600">
                        {s.to}
                      </span>
                    </div>
                    <div className="font-bold text-slate-800">
                      €{s.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
