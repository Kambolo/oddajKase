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
import type { Expense, SummaryCard } from "../lib/types";
import { addExpense, removeIncomeDetail, removeExpenseDetail } from "../store/dataSlice";
import { useAppDispatch, useAppSelector } from "../store/store";
import { buildPersonalSummary } from "../util/finance";
import { formatMoney } from "../util/utils";

type Transaction = {
  id: string;
  title: string;
  amount: string;
  date: string;
  meta: string;
  tone: "neutral" | "danger" | "success";
};

const splitAmountForCurrentUser = (
  expense: Expense,
  currentContactId: string | null,
) => {
  if (!currentContactId) return 0;

  const split = expense.splits.find((item) => item.contactId === currentContactId);
  if (!split) return 0;

  if (expense.payerId === currentContactId) {
    return expense.splits
      .filter((item) => item.contactId !== currentContactId)
      .reduce((sum, item) => sum + item.amount, 0);
  }

  return split.amount;
};

export default function DashboardPage() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<SummaryCard | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const groups = useAppSelector((state) => state.data.groups);
  const contacts = useAppSelector((state) => state.data.contacts);
  const expenses = useAppSelector((state) => state.data.expenses);

  const currentContactId = SELF_CONTACT_ID;

  useEffect(() => {
    initGoogleAnalytics();
    trackPageView(location.pathname);
  }, [location.pathname]);

  const storeBalanceDetails = useAppSelector((s) => s.data.balanceDetails);
  const storeExpenseDetails = useAppSelector((s) => s.data.expenseDetails);
  const storeIncomeDetails = useAppSelector((s) => s.data.incomeDetails);

  const personalSummary = useMemo(() => {
    const hasMock = (storeBalanceDetails?.length ?? 0) > 0 || (storeExpenseDetails?.length ?? 0) > 0 || (storeIncomeDetails?.length ?? 0) > 0;
    if (hasMock) {
      const round = (v: number) => parseFloat(v.toFixed(2));
      const expenseTotal = round(storeExpenseDetails.reduce((sum, it) => sum + Math.abs(it.amount), 0));
      const incomeTotal = round(storeIncomeDetails.reduce((sum, it) => sum + it.amount, 0));
      const balanceTotal = round((storeBalanceDetails ?? []).reduce((sum, it) => sum + it.amount, 0));
      return {
        balanceTotal,
        expenseTotal,
        incomeTotal,
        balanceDetails: storeBalanceDetails,
        expenseDetails: storeExpenseDetails,
        incomeDetails: storeIncomeDetails,
      };
    }

    return buildPersonalSummary(expenses, groups, contacts, currentContactId);
  }, [storeBalanceDetails, storeExpenseDetails, storeIncomeDetails, contacts, currentContactId, expenses, groups]);

  const cardData: SummaryCard[] = useMemo(
    () => [
      {
        id: "balance",
        title: "Balance",
        value: formatMoney(personalSummary.balanceTotal),
        subtitle: "Net",
        description: `Your net position based on shared expenses for ${SELF_CONTACT_LABEL}.`,
        details: personalSummary.balanceDetails,
        tone: "neutral",
      },
      {
        id: "expenses",
        title: "Expenses",
        // show as negative value to make intent clear in UI
        value: formatMoney(-personalSummary.expenseTotal),
        subtitle: "You owe",
        description: "Amounts you owe to other people from shared expenses.",
        details: personalSummary.expenseDetails,
        tone: "danger",
      },

      {
        id: "income",
        title: "Income",
        value: formatMoney(personalSummary.incomeTotal),
        subtitle: "Owes you",
        description: "Amounts other people owe you from expenses you paid.",
        details: personalSummary.incomeDetails,
        tone: "success",
      },
    ],
    [
      personalSummary.balanceDetails,
      personalSummary.balanceTotal,
      personalSummary.expenseDetails,
      personalSummary.expenseTotal,
      personalSummary.incomeDetails,
      personalSummary.incomeTotal,
    ],
  );

  const transactions: Transaction[] = useMemo(
    () =>
      expenses.map((expense) => {
        const groupName =
          groups.find((group) => group.id === expense.groupId)?.name ?? "Group";
        const payerName =
          expense.payerId === SELF_CONTACT_ID
            ? SELF_CONTACT_LABEL
            : contacts.find((contact) => contact.id === expense.payerId)?.name ??
              "Unknown";
        const currentShare = splitAmountForCurrentUser(expense, currentContactId);
        const currentPayer = currentContactId === expense.payerId;

        if (currentPayer) {
          return {
            id: expense.id,
            title: expense.name,
            amount: `+${formatMoney(currentShare)}`,
            date: expense.date,
            meta: `${groupName} - paid by me`,
            tone: "success" as const,
          };
        }

        if (currentShare > 0) {
          return {
            id: expense.id,
            title: expense.name,
            amount: `-${formatMoney(currentShare)}`,
            date: expense.date,
            meta: `${groupName} - paid by ${payerName}`,
            tone: "danger" as const,
          };
        }

        return {
          id: expense.id,
          title: expense.name,
          amount: formatMoney(expense.amount),
          date: expense.date,
          meta: `${groupName} - paid by ${payerName}`,
          tone: "neutral" as const,
        };
      }),
    [contacts, currentContactId, expenses, groups],
  );

  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;

    const query = searchQuery.toLowerCase();
    return transactions.filter((item) =>
      `${item.title} ${item.meta}`.toLowerCase().includes(query),
    );
  }, [transactions, searchQuery]);

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
                            <div className="text-sm text-text/60">{item.meta}</div>
                            <div className="text-sm text-text/60">{item.date}</div>
                          </div>

                          <div
                            className={`font-semibold ${
                              item.tone === "success"
                                ? "text-emerald-400"
                                : item.tone === "danger"
                                  ? "text-rose-400"
                                  : "text-text"
                            }`}
                          >
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
                  <SummaryCards cards={cardData} onCardClick={setSelectedCard} />

                  <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-text">
                          Recent activity
                        </h2>

                        <p className="mt-1 text-sm text-text/70">
                          Latest transactions and expense history.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="space-y-3">
                        {transactions.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-4"
                          >
                            <div>
                              <div className="font-semibold text-text">
                                {item.title}
                              </div>
                              <div className="text-sm text-text/60">{item.meta}</div>
                              <div className="text-sm text-text/60">{item.date}</div>
                            </div>

                            <div
                              className={`font-semibold ${
                                item.tone === "success"
                                  ? "text-emerald-400"
                                  : item.tone === "danger"
                                    ? "text-rose-400"
                                    : "text-text"
                              }`}
                            >
                              {item.amount}
                            </div>
                          </div>
                        ))}
                      </div>
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
                      <div className="rounded-3xl bg-rose-500/10 p-4 text-sm text-rose-200">
                        Expenses are shown in red because they reduce what you
                        owe.
                      </div>

                      <div className="rounded-3xl bg-emerald-500/10 p-4 text-sm text-emerald-200">
                        Income is shown in green because it increases what
                        others owe you.
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
        currentContactId={currentContactId}
        onClose={() => setIsNewExpenseOpen(false)}
        onSave={handleNewExpenseSave}
      />

      <Modal
        open={Boolean(selectedCard)}
        title={selectedCard?.title ?? "Info"}
        onClose={() => setSelectedCard(null)}
      >
        <div className="space-y-4">
          <p className="text-sm leading-7 text-text/80">
            {selectedCard?.description}
          </p>
          <div className="space-y-3 pt-3">
            {selectedCard?.details.map((item) => {
              const formatted = formatMoney(item.amount);
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div>
                    <div className="font-medium text-text">{item.label}</div>
                    {item.meta && (
                      <div className="text-sm text-slate-500">{item.meta}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`font-semibold ${item.amount < 0 ? "text-rose-500" : "text-emerald-500"}`}
                    >
                      {formatted}
                    </div>
                    {(selectedCard?.id === "income" || selectedCard?.id === "expenses") && (
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedCard?.id === "income") dispatch(removeIncomeDetail(item.label));
                          else dispatch(removeExpenseDetail(item.label));
                        }}
                        className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-500 hover:bg-emerald-500/20"
                      >
                        Paid
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
}
