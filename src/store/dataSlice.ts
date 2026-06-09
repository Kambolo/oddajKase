import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { SELF_CONTACT_ID } from "../lib/self";
import type {
  Contact,
  Expense,
  ExpenseSplit,
  Group,
  GroupExpense,
  SummaryItem,
  Transaction,
} from "../lib/types";

// ─── helpers ──────────────────────────────────────────────────────────────────

/**
 * Recomputes memberBalances and balance string for a group from scratch,
 * based on its expenses and payments arrays.
 *
 *   positive balance → member is owed money
 *   negative balance → member owes money
 */
function recomputeGroup(group: Group): void {
  const balances: Record<string, number> = {};
  const ensure = (id: string) => {
    if (!(id in balances)) balances[id] = 0;
  };

  for (const exp of group.expenses ?? []) {
    const payerId = exp.payerId ?? exp.paidBy;
    const splits = normalizeExpenseSplits(exp.amount, exp.splits, exp.splitBetween);
    if (splits.length === 0) continue;

    ensure(payerId);
    balances[payerId] += exp.amount;
    for (const split of splits) {
      ensure(split.contactId);
      balances[split.contactId] -= split.amount;
    }
  }

  for (const pay of group.payments ?? []) {
    ensure(pay.from);
    ensure(pay.to);
    balances[pay.from] += pay.amount;
    balances[pay.to] -= pay.amount;
  }

  group.memberBalances = {};
  for (const id of group.memberIds) {
    group.memberBalances[id] = parseFloat((balances[id] ?? 0).toFixed(2));
  }

  // balance string = sum of what creditors are owed (positive side)
  const totalOwed = Object.values(group.memberBalances)
    .filter((v) => v > 0)
    .reduce((s, v) => s + v, 0);

  group.balance = `€${totalOwed.toFixed(2)}`;
}

function normalizeExpenseSplits(
  amount: number,
  splits: ExpenseSplit[] | undefined,
  splitBetween: string[] | undefined,
): ExpenseSplit[] {
  if (splits?.length) {
    return splits.map((split) => ({
      contactId: split.contactId,
      amount: parseFloat(split.amount.toFixed(2)),
    }));
  }

  const ids = splitBetween ?? [];
  if (ids.length === 0) return [];

  const baseCents = Math.floor((amount * 100) / ids.length);
  let remainingCents = Math.round(amount * 100) - baseCents * ids.length;

  return ids.map((contactId) => {
    const cents = baseCents + (remainingCents > 0 ? 1 : 0);
    if (remainingCents > 0) remainingCents -= 1;
    return { contactId, amount: cents / 100 };
  });
}

function toDashboardExpense(groupId: string, expense: GroupExpense): Expense {
  const payerId = expense.payerId ?? expense.paidBy;
  const splitWithIds = expense.splitWithIds ?? expense.splitBetween;

  return {
    id: expense.id,
    name: expense.name ?? expense.title,
    amount: expense.amount,
    category: expense.category ?? "General",
    groupId,
    payerId,
    splitMode: expense.splitMode ?? "equal",
    splitWithIds,
    splits: normalizeExpenseSplits(expense.amount, expense.splits, splitWithIds),
    date: expense.date,
  };
}

// ─── seed data ────────────────────────────────────────────────────────────────

const balanceDetails: SummaryItem[] = [
  { label: "Anna Kowalska", amount: -35.2, meta: "You owe" },
  { label: "Jan Nowak", amount: 15.0, meta: "Owes you" },
  { label: "Marta Wiśniewska", amount: 20.0, meta: "Owes you" },
  { label: "Tomasz Zieliński", amount: -45.5, meta: "You owe" },
];

const expenseDetails: SummaryItem[] = [
  { label: "Lunch with friends", amount: -24.5, meta: "to Jan Nowak" },
  { label: "Train ticket", amount: -18.2, meta: "to Marta Wiśniewska" },
  { label: "Office snacks", amount: -12.0, meta: "to Tomek" },
];

const incomeDetails: SummaryItem[] = [
  { label: "Agnieszka Mazur", amount: 50.0, meta: "Owes you" },
  { label: "Jan Nowak", amount: 20.0, meta: "Owes you" },
  { label: "Marta Wiśniewska", amount: 15.5, meta: "Owes you" },
];

const contacts: Contact[] = [
  { id: "c1", name: "Anna Kowalska", email: "anna@example.com" },
  { id: "c2", name: "Jan Nowak", email: "jan@example.com" },
  { id: "c3", name: "Marta Wiśniewska", email: "marta@example.com" },
  { id: "c4", name: "Tomasz Zieliński", email: "tomasz@example.com" },
  { id: "c5", name: "Agnieszka Mazur", email: "agnieszka@example.com" },
];

const initialTransactions: Transaction[] = [
  { id: "1", title: "Coffee", amount: "-€3.50", date: "May 17" },
  { id: "2", title: "Groceries", amount: "-€42.30", date: "May 16" },
  { id: "3", title: "Donation received", amount: "+€150.00", date: "May 15" },
];

// Groups — balances are derived via recomputeGroup, not hardcoded
const rawGroups: Group[] = [
  {
    id: "g1",
    name: "Weekend trip",
    memberIds: ["c1", "c2", "c3"],
    balance: "",
    memberBalances: {},
    inviteCode: "ABC123",
    expenses: [
      {
        id: "e1",
        title: "Hotel — 2 nights",
        amount: 180.0,
        paidBy: "c2",
        splitBetween: ["c1", "c2", "c3"],
        date: "2025-06-14",
      },
      {
        id: "e2",
        title: "Dinner at Trattoria",
        amount: 87.0,
        paidBy: "c1",
        splitBetween: ["c1", "c2", "c3"],
        date: "2025-06-15",
      },
      {
        id: "e3",
        title: "Train tickets",
        amount: 54.0,
        paidBy: "c3",
        splitBetween: ["c1", "c3"],
        date: "2025-06-13",
      },
      {
        id: "e4",
        title: "Museum entry",
        amount: 36.0,
        paidBy: "c2",
        splitBetween: ["c1", "c2", "c3"],
        date: "2025-06-15",
      },
    ],
    payments: [
      { id: "p1", from: "c1", to: "c2", amount: 40.5, date: "2025-06-18" },
    ],
  },
  {
    id: "g2",
    name: "Office lunch",
    memberIds: ["c2", "c4"],
    balance: "",
    memberBalances: {},
    inviteCode: "XYZ789",
    expenses: [
      {
        id: "e5",
        title: "Pizza Margherita × 4",
        amount: 48.0,
        paidBy: "c4",
        splitBetween: ["c2", "c4"],
        date: "2025-06-10",
      },
      {
        id: "e6",
        title: "Drinks & desserts",
        amount: 22.2,
        paidBy: "c2",
        splitBetween: ["c2", "c4"],
        date: "2025-06-10",
      },
    ],
    payments: [],
  },
  {
    id: "g3",
    name: "Charity gift",
    memberIds: ["c1", "c3", "c4"],
    balance: "",
    memberBalances: {},
    inviteCode: "GRP001",
    expenses: [
      {
        id: "e7",
        title: "Gift basket",
        amount: 75.0,
        paidBy: "c1",
        splitBetween: ["c1", "c3", "c4"],
        date: "2025-06-05",
      },
      {
        id: "e8",
        title: "Wrapping & card",
        amount: 12.0,
        paidBy: "c3",
        splitBetween: ["c1", "c3", "c4"],
        date: "2025-06-05",
      },
      {
        id: "e9",
        title: "Delivery fee",
        amount: 8.0,
        paidBy: "c4",
        splitBetween: ["c1", "c3", "c4"],
        date: "2025-06-06",
      },
    ],
    payments: [
      { id: "p2", from: "c3", to: "c1", amount: 25.0, date: "2025-06-07" },
      { id: "p3", from: "c4", to: "c1", amount: 25.0, date: "2025-06-07" },
    ],
  },
];

rawGroups.forEach(recomputeGroup);
const initialExpenses: Expense[] = rawGroups.flatMap((group) =>
  (group.expenses ?? []).map((expense) => toDashboardExpense(group.id, expense)),
);

// ─── slice ────────────────────────────────────────────────────────────────────

interface DataState {
  balanceDetails: SummaryItem[];
  expenseDetails: SummaryItem[];
  incomeDetails: SummaryItem[];
  contacts: Contact[];
  groups: Group[];
  expenses: Expense[];
  transactions: Transaction[];
}

const initialState: DataState = {
  balanceDetails,
  expenseDetails,
  incomeDetails,
  contacts,
  groups: rawGroups,
  expenses: initialExpenses,
  transactions: initialTransactions,
};

export const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    addGroup: (
      state,
      action: PayloadAction<{ name: string; inviteCode: string }>,
    ) => {
      const { name, inviteCode } = action.payload;
      const newGroup: Group = {
        id: `g${Date.now()}`,
        name,
        balance: "€0.00",
        memberIds: [SELF_CONTACT_ID],
        memberBalances: { [SELF_CONTACT_ID]: 0 },
        inviteCode,
        expenses: [],
        payments: [],
      };
      state.groups.unshift(newGroup);
    },

    joinGroup: (state, action: PayloadAction<{ inviteCode: string }>) => {
      const { inviteCode } = action.payload;
      const group = state.groups.find(
        (g) => g.inviteCode?.toUpperCase() === inviteCode.toUpperCase(),
      );
      if (!group) return;
      if (!group.memberIds.includes("me")) {
        group.memberIds.push("me");
        recomputeGroup(group);
      }
    },

    updateGroupMembers: (
      state,
      action: PayloadAction<{ groupId: string; memberIds: string[] }>,
    ) => {
      const { groupId, memberIds } = action.payload;
      const group = state.groups.find((g) => g.id === groupId);
      if (!group) return;
      group.memberIds = memberIds;
      recomputeGroup(group);
    },

    deleteGroup: (state, action: PayloadAction<string>) => {
      state.groups = state.groups.filter((g) => g.id !== action.payload);
    },

    addExpense: (
      state,
      action: PayloadAction<{
        name: string;
        amount: number;
        category: string;
        groupId: string;
        payerId: string;
        splitMode: "equal" | "amount" | "percent";
        splitWithIds: string[];
        splits: ExpenseSplit[];
      }>,
    ) => {
      const {
        name,
        amount,
        category,
        groupId,
        payerId,
        splitMode,
        splitWithIds,
        splits,
      } = action.payload;
      const contact =
        payerId === SELF_CONTACT_ID
          ? { name: "You" }
          : state.contacts.find((c) => c.id === payerId);
      const numericAmount = Math.abs(amount || 0);
      const normalizedSplits = normalizeExpenseSplits(
        numericAmount,
        splits,
        splitWithIds,
      );
      const expenseId = `e${Date.now()}`;
      const date = new Date().toISOString().split("T")[0];

      state.expenseDetails.unshift({
        label: name,
        amount: -numericAmount,
        meta: `to ${contact?.name || "Unknown"}`,
      });

      state.transactions.unshift({
        id: expenseId,
        title: name,
        amount: `-€${numericAmount.toFixed(2)}`,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      });

      const group = state.groups.find((g) => g.id === groupId);
      if (group) {
        if (!group.expenses) group.expenses = [];
        for (const id of [payerId, ...splitWithIds]) {
          if (!group.memberIds.includes(id)) group.memberIds.push(id);
        }
        group.expenses.unshift({
          id: expenseId,
          name,
          title: name,
          amount: numericAmount,
          category,
          groupId,
          payerId,
          paidBy: payerId,
          splitMode,
          splitWithIds,
          splits: normalizedSplits,
          splitBetween: splitWithIds,
          date,
        });
        recomputeGroup(group);
      }

      state.expenses.unshift({
        id: expenseId,
        name,
        amount: numericAmount,
        category,
        groupId,
        payerId,
        splitMode,
        splitWithIds,
        splits: normalizedSplits,
        date,
      });
    },

    /**
     * Records a payment from `fromId` to `toId` for `amount`,
     * then recomputes all balances. Use this when "Mark as paid" is clicked
     * on a settlement suggestion in the Settle up tab.
     */
    markSettlementPaid: (
      state,
      action: PayloadAction<{
        groupId: string;
        fromId: string;
        toId: string;
        amount: number;
      }>,
    ) => {
      const { groupId, fromId, toId, amount } = action.payload;
      const group = state.groups.find((g) => g.id === groupId);
      if (!group) return;
      if (!group.payments) group.payments = [];
      group.payments.push({
        id: `p${Date.now()}`,
        from: fromId,
        to: toId,
        amount: parseFloat(amount.toFixed(2)),
        date: new Date().toISOString().split("T")[0],
      });
      recomputeGroup(group);
    },

    // Removes one income detail entry (used when user marks an owed amount as paid)
    removeIncomeDetail: (state, action: PayloadAction<string>) => {
      const label = action.payload;
      state.incomeDetails = state.incomeDetails.filter((item) => item.label !== label);
    },

    // Removes one expense detail entry (used when user marks an amount they owe as paid)
    removeExpenseDetail: (state, action: PayloadAction<string>) => {
      const label = action.payload;
      state.expenseDetails = state.expenseDetails.filter((item) => item.label !== label);
    },
  },
});

export const {
  addGroup,
  updateGroupMembers,
  deleteGroup,
  addExpense,
  joinGroup,
  markSettlementPaid,
  removeIncomeDetail,
  removeExpenseDetail,
} = dataSlice.actions;
export default dataSlice.reducer;
