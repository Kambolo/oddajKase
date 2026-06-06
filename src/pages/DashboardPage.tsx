import { useMemo, useState } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Modal from "../components/common/Modal";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import NewExpenseModal from "../components/dashboard/NewExpenseModal";
import SummaryCards from "../components/dashboard/SummaryCards";
import SideBar from "../components/layout/common/SideBar";
import TopBar from "../components/layout/common/TopBar";
import { initGoogleAnalytics, trackPageView } from "../lib/googleAnalytics";

type Contact = {
  id: string;
  name: string;
  email: string;
};

type Group = {
  id: string;
  name: string;
  memberIds: string[];
};

const contacts: Contact[] = [
  { id: "c1", name: "Anna Kowalska", email: "anna@example.com" },
  { id: "c2", name: "Jan Nowak", email: "jan@example.com" },
  { id: "c3", name: "Marta Wiśniewska", email: "marta@example.com" },
  { id: "c4", name: "Tomasz Zieliński", email: "tomasz@example.com" },
];

const groups: Group[] = [
  { id: "g1", name: "Weekend trip", memberIds: ["c1", "c2", "c3"] },
  { id: "g2", name: "Office lunch", memberIds: ["c2", "c4"] },
  { id: "g3", name: "Charity gift", memberIds: ["c1", "c3", "c4"] },
];

type SummaryItem = {
  label: string;
  amount: number;
  meta?: string;
};

type SummaryCard = {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  description: string;
  details: SummaryItem[];
};

const balanceDetails: SummaryItem[] = [
  { label: "Anna Kowalska", amount: -35.2, meta: "You owe" },
  { label: "Jan Nowak", amount: 15.0, meta: "Owes you" },
  { label: "Marta Wiśniewska", amount: 20.0, meta: "Owes you" },
  { label: "Tomasz Zieliński", amount: -45.5, meta: "You owe" },
];

const expenseDetails: SummaryItem[] = [
  { label: "Lunch with friends", amount: 24.5, meta: "to Jan Nowak" },
  { label: "Train ticket", amount: 18.2, meta: "to Marta Wiśniewska" },
  { label: "Office snacks", amount: 12.0, meta: "to Tomek" },
];

const incomeDetails: SummaryItem[] = [
  { label: "Agnieszka Mazur", amount: 50.0, meta: "Paid back" },
  { label: "Jan Nowak", amount: 20.0, meta: "Paid back" },
  { label: "Marta Wiśniewska", amount: 15.5, meta: "Paid back" },
];

const formatMoney = (value: number) => {
  const sign = value < 0 ? "-" : "";
  return `${sign}€${Math.abs(value).toFixed(2)}`;
};

const cardData: SummaryCard[] = [
  {
    id: "balance",
    title: "Balance",
    value: formatMoney(
      balanceDetails.reduce((sum, item) => sum + item.amount, 0),
    ),
    subtitle: "Available",
    description:
      "See the balance for each group member and how much they owe or are owed.",
    details: balanceDetails,
  },
  {
    id: "expenses",
    title: "Expenses",
    value: formatMoney(
      expenseDetails.reduce((sum, item) => sum + item.amount, 0),
    ),
    subtitle: "This month",
    description: "The latest expenses that you still owe to other people.",
    details: expenseDetails,
  },
  {
    id: "income",
    title: "Income",
    value: formatMoney(
      incomeDetails.reduce((sum, item) => sum + item.amount, 0),
    ),
    subtitle: "Total",
    description: "People who already paid you back and how much they returned.",
    details: incomeDetails,
  },
];

export default function DashboardPage() {
  const location = useLocation();
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<SummaryCard | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    initGoogleAnalytics();
    trackPageView(location.pathname);
  }, [location.pathname]);

  const transactions = useMemo(
    () => [
      { id: "1", title: "Coffee", amount: "-€3.50", date: "May 17" },
      { id: "2", title: "Groceries", amount: "-€42.30", date: "May 16" },
      {
        id: "3",
        title: "Donation received",
        amount: "+€150.00",
        date: "May 15",
      },
    ],
    [],
  );

  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;

    return transactions.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [transactions, searchQuery]);

  const openInfo = (card: SummaryCard) => {
    setSelectedCard(card);
  };

  const handleNewExpenseSave = (data: {
    name: string;
    amount: string;
    category: string;
    groupId: string;
    personId: string;
  }) => {
    const group = groups.find((item) => item.id === data.groupId);
    const contact = contacts.find((item) => item.id === data.personId);
    console.log("Saved expense:", {
      ...data,
      groupName: group?.name,
      personName: contact?.name,
    });
  };

  return (
    <div className="flex h-dvh min-h-screen bg-brand">
      <SideBar onAction={() => setIsNewExpenseOpen(true)} />

      {/* Right side: TopBar + scrollable content */}
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
                              {item.date}
                            </div>
                          </div>

                          <div
                            className={`font-semibold ${
                              item.amount.startsWith("+")
                                ? "text-emerald-400"
                                : "text-rose-400"
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
                  <SummaryCards cards={cardData} onCardClick={openInfo} />

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

                              <div className="text-sm text-text/60">
                                {item.date}
                              </div>
                            </div>

                            <div
                              className={`font-semibold ${
                                item.amount.startsWith("+")
                                  ? "text-emerald-400"
                                  : "text-rose-400"
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
                  <div
                    className={`font-semibold ${item.amount < 0 ? "text-rose-500" : "text-emerald-500"}`}
                  >
                    {formatted}
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
