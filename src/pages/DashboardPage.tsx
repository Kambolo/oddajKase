import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Modal from "../components/common/Modal";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import NewExpenseModal from "../components/dashboard/NewExpenseModal";
import SummaryCards from "../components/dashboard/SummaryCards";
import SideBar from "../components/layout/common/SideBar";
import TopBar from "../components/layout/common/TopBar";
import { initGoogleAnalytics, trackPageView } from "../lib/googleAnalytics";
import { SELF_CONTACT_ID, SELF_CONTACT_LABEL } from "../lib/self";
import type { SummaryCard, SummaryItem } from "../lib/types";
import { addExpense, markSettlementPaid } from "../store/dataSlice";
import { useAppDispatch, useAppSelector } from "../store/store";
import { formatMoney } from "../util/utils";

type Transaction = {
  id: string;
  title: string;
  amount: string;
  date: string;
  paidBy: string;
};

type OwedEntry = { amount: number; groupId: string; expenseName: string };

type SettlementItem = SummaryItem & {
  groupId?: string;
  fromId?: string;
  toId?: string;
  rawAmount: number;
};

export default function DashboardPage() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [confirmingKey, setConfirmingKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const groups = useAppSelector((state) => state.data.groups);
  const contacts = useAppSelector((state) => state.data.contacts);
  const expenses = useAppSelector((state) => state.data.expenses);
  const settledDebts = useAppSelector((state) => state.data.settledDebts ?? []);

  useEffect(() => {
    initGoogleAnalytics();
    trackPageView(location.pathname);
  }, [location.pathname]);

  const getName = (id: string) => {
    if (id === SELF_CONTACT_ID) return SELF_CONTACT_LABEL;
    return contacts.find((c) => c.id === id)?.name ?? "Unknown";
  };

  const transactions: Transaction[] = useMemo(
    () =>
      expenses.map((expense) => {
        const groupName =
          groups.find((g) => g.id === expense.groupId)?.name ?? "Group";
        return {
          id: expense.id,
          title: expense.name,
          amount: formatMoney(expense.amount),
          date: expense.date,
          paidBy: `${groupName} · paid by ${getName(expense.payerId)}`,
        };
      }),
    [expenses, groups, contacts],
  );

  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter((t) =>
      `${t.title} ${t.paidBy}`.toLowerCase().includes(q),
    );
  }, [transactions, searchQuery]);

  const { expenseItems, incomeItems } = useMemo(() => {
    const owedToMeMap: Record<
      string,
      { total: number; groupId: string; names: string[]; fromId: string }
    > = {};
    const iOweMap: Record<
      string,
      { total: number; groupId: string; names: string[]; toId: string }
    > = {};

    for (const exp of expenses) {
      const iAmPayer = exp.payerId === SELF_CONTACT_ID;

      if (iAmPayer) {
        for (const split of exp.splits) {
          if (split.contactId === SELF_CONTACT_ID) continue;
          const id = split.contactId;
          if (!owedToMeMap[id])
            owedToMeMap[id] = {
              total: 0,
              groupId: exp.groupId,
              names: [],
              fromId: id,
            };
          owedToMeMap[id].total += split.amount;
          owedToMeMap[id].names.push(exp.name);
        }
      } else {
        const mySplit = exp.splits.find((s) => s.contactId === SELF_CONTACT_ID);
        if (mySplit) {
          const id = exp.payerId;
          if (!iOweMap[id])
            iOweMap[id] = {
              total: 0,
              groupId: exp.groupId,
              names: [],
              toId: id,
            };
          iOweMap[id].total += mySplit.amount;
          iOweMap[id].names.push(exp.name);
        }
      }
    }

    // Odejmij rozliczone płatności
    for (const settled of settledDebts) {
      // Ktoś zapłacił mnie → zmniejsz owedToMeMap
      if (settled.toId === SELF_CONTACT_ID && owedToMeMap[settled.fromId]) {
        owedToMeMap[settled.fromId].total = Math.max(
          0,
          owedToMeMap[settled.fromId].total - settled.amount,
        );
      }
      // Ja zapłaciłem komuś → zmniejsz iOweMap
      if (settled.fromId === SELF_CONTACT_ID && iOweMap[settled.toId]) {
        iOweMap[settled.toId].total = Math.max(
          0,
          iOweMap[settled.toId].total - settled.amount,
        );
      }
    }

    const expItems: SettlementItem[] = Object.values(owedToMeMap)
      .filter((e) => e.total > 0.009)
      .map((e) => ({
        label: getName(e.fromId),
        amount: parseFloat(e.total.toFixed(2)),
        rawAmount: parseFloat(e.total.toFixed(2)),
        meta: e.names.join(", "),
        groupId: e.groupId,
        fromId: e.fromId,
        toId: SELF_CONTACT_ID,
      }));

    const incItems: SettlementItem[] = Object.values(iOweMap)
      .filter((e) => e.total > 0.009)
      .map((e) => ({
        label: getName(e.toId),
        amount: -parseFloat(e.total.toFixed(2)),
        rawAmount: parseFloat(e.total.toFixed(2)),
        meta: e.names.join(", "),
        groupId: e.groupId,
        fromId: SELF_CONTACT_ID,
        toId: e.toId,
      }));

    return { expenseItems: expItems, incomeItems: incItems };
  }, [expenses, contacts, settledDebts]);

  const expenseTotal = useMemo(
    () =>
      parseFloat(expenseItems.reduce((s, i) => s + i.rawAmount, 0).toFixed(2)),
    [expenseItems],
  );

  const incomeTotal = useMemo(
    () =>
      parseFloat(incomeItems.reduce((s, i) => s + i.rawAmount, 0).toFixed(2)),
    [incomeItems],
  );

  const balanceTotal = parseFloat((expenseTotal - incomeTotal).toFixed(2));

  const balanceDetails: SummaryItem[] = useMemo(
    () => [
      ...expenseItems.map((i) => ({ ...i, meta: `${i.label} owes you` })),
      ...incomeItems.map((i) => ({ ...i, meta: `you owe ${i.label}` })),
    ],
    [expenseItems, incomeItems],
  );

  const cardData: SummaryCard[] = useMemo(
    () => [
      {
        id: "balance",
        title: "Balance",
        value: formatMoney(balanceTotal),
        subtitle: "Net",
        description:
          "Your overall net position — what others owe you minus what you owe others.",
        details: balanceDetails,
      },
      {
        id: "expenses",
        title: "Owed to you",
        value: formatMoney(expenseTotal),
        subtitle: "Owed to you",
        description:
          "You paid for these expenses — here's who owes you their share.",
        details: expenseItems,
      },
      {
        id: "income",
        title: "You owe",
        value: formatMoney(-incomeTotal),
        subtitle: "You owe",
        description: "Someone else paid — here's what you owe them.",
        details: incomeItems,
      },
    ],
    [
      balanceTotal,
      balanceDetails,
      expenseTotal,
      expenseItems,
      incomeTotal,
      incomeItems,
    ],
  );

  const selectedCard = useMemo(
    () => cardData.find((c) => c.id === selectedCardId) ?? null,
    [cardData, selectedCardId],
  );

  const selectedItems = (selectedCard?.details ?? []) as SettlementItem[];

  const handleMarkPaid = (item: SettlementItem) => {
    console.log("handleMarkPaid", item); // ← dodaj to tymczasowo
    if (!item.groupId || !item.fromId || !item.toId) {
      console.warn("Missing groupId/fromId/toId — bail", item);
      return;
    }
    dispatch(
      markSettlementPaid({
        groupId: item.groupId,
        fromId: item.fromId,
        toId: item.toId,
        amount: item.rawAmount,
      }),
    );
    setConfirmingKey(null);
  };

  const handleNewExpenseSave = (data: {
    name: string;
    amount: string;
    category: string;
    groupId: string;
    payerId: string;
    splitMode: "equal" | "amount" | "percent";
    splitWithIds: string[];
    splits: { contactId: string; amount: number }[];
  }) => {
    const amount = Number.parseFloat(data.amount.replace(/[^0-9.-]/g, ""));
    if (Number.isNaN(amount)) return;
    dispatch(
      addExpense({
        name: data.name,
        amount,
        category: data.category,
        groupId: data.groupId,
        payerId: data.payerId,
        splitMode: data.splitMode,
        splitWithIds: data.splitWithIds,
        splits: data.splits,
      }),
    );
  };

  return (
    <div className="flex h-dvh min-h-screen bg-brand">
      <SideBar onAction={() => setIsNewExpenseOpen(true)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          searchPlaceholder="Search expenses..."
          onSearch={setSearchQuery}
        />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <DashboardHeader onNewExpense={() => setIsNewExpenseOpen(true)} />

            {searchQuery.trim() ? (
              <section className="space-y-6">
                <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-sm">
                  <h2 className="text-2xl font-semibold text-text">
                    Search results
                  </h2>
                  <p className="mt-2 text-sm text-text/70">
                    Results for "{searchQuery}"
                  </p>
                  <div className="mt-6 space-y-3">
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-4"
                        >
                          <div>
                            <div className="font-semibold text-text">
                              {item.title}
                            </div>
                            <div className="text-sm text-text/60">
                              {item.paidBy}
                            </div>
                            <div className="text-sm text-text/60">
                              {item.date}
                            </div>
                          </div>
                          <div className="font-semibold text-text">
                            {item.amount}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-text/60">
                        No matching expenses found.
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ) : (
              <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                  <SummaryCards
                    cards={cardData}
                    onCardClick={(card) => {
                      setSelectedCardId(card.id);
                      setConfirmingKey(null);
                    }}
                  />

                  <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-sm">
                    <div>
                      <h2 className="text-lg font-semibold text-text">
                        Recent activity
                      </h2>
                      <p className="mt-1 text-sm text-text/70">
                        Latest transactions and expense history.
                      </p>
                    </div>
                    <div className="mt-5 space-y-3">
                      {transactions.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-4"
                        >
                          <div>
                            <div className="font-semibold text-text">
                              {item.title}
                            </div>
                            <div className="text-sm text-text/60">
                              {item.paidBy}
                            </div>
                            <div className="text-sm text-text/60">
                              {item.date}
                            </div>
                          </div>
                          <div className="font-semibold text-text">
                            {item.amount}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <aside className="space-y-6">
                  <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-text">
                      Quick insights
                    </h2>
                    <p className="mt-3 text-sm text-text/70">
                      Click any summary card to learn more about what the value
                      means.
                    </p>
                    <div className="mt-6 space-y-3">
                      <div className="rounded-3xl bg-accent/5 p-4 text-sm text-text/80">
                        Keep your expenses under control and track income trends
                        from this dashboard.
                      </div>
                      <div className="rounded-3xl bg-accent/5 p-4 text-sm text-text/80">
                        Use + New expense to quickly add a transaction
                        placeholder.
                      </div>
                    </div>
                  </div>
                </aside>
              </section>
            )}
          </div>
        </div>
      </div>

      <NewExpenseModal
        open={isNewExpenseOpen}
        groups={groups}
        contacts={contacts}
        currentContactId={SELF_CONTACT_ID}
        onClose={() => setIsNewExpenseOpen(false)}
        onSave={handleNewExpenseSave}
      />

      <Modal
        open={Boolean(selectedCard)}
        title={selectedCard?.title ?? "Info"}
        onClose={() => {
          setSelectedCardId(null);
          setConfirmingKey(null);
        }}
      >
        <div className="space-y-4">
          <p className="text-sm leading-7 text-text/80">
            {selectedCard?.description}
          </p>

          <div className="space-y-3 pt-3">
            {selectedItems.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
                🎉 All settled up!
              </div>
            )}

            {selectedItems.map((item, i) => {
              const key = `${item.fromId}-${item.toId}-${i}`;
              const isConfirming = confirmingKey === key;
              const canSettle =
                selectedCardId === "income" || selectedCardId === "expenses";

              // expenses card = green (owed TO you), income card = red (you owe)
              const amountColor =
                selectedCardId === "expenses"
                  ? "text-emerald-600"
                  : selectedCardId === "income"
                    ? "text-rose-500"
                    : item.amount >= 0
                      ? "text-emerald-600"
                      : "text-rose-500";

              const amountPrefix =
                selectedCardId === "expenses"
                  ? "+"
                  : selectedCardId === "income"
                    ? "-"
                    : item.amount >= 0
                      ? "+"
                      : "-";

              return (
                <div
                  key={key}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-800">
                        {item.label}
                      </div>
                      {item.meta && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          {item.meta}
                        </div>
                      )}
                    </div>
                    <div
                      className={`text-sm font-bold shrink-0 ${amountColor}`}
                    >
                      {amountPrefix}€{Math.abs(item.rawAmount).toFixed(2)}
                    </div>
                  </div>

                  {canSettle && (
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      {isConfirming ? (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-slate-500">
                            Confirm this payment was made?
                          </span>
                          <div className="flex gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setConfirmingKey(null)}
                              className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkPaid(item)}
                              className="cursor-pointer rounded-lg bg-accent-dark px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-dark/90 transition-colors"
                            >
                              Confirm
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmingKey(key)}
                          className="cursor-pointer rounded-lg bg-accent-dark px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-dark/90 transition-colors"
                        >
                          Mark as paid
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
}
