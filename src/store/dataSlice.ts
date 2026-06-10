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

function recomputeGroup(group: Group): void {
  const balances: Record<string, number> = {};
  const ensure = (id: string) => {
    if (!(id in balances)) balances[id] = 0;
  };

  for (const exp of group.expenses ?? []) {
    const payerId = exp.payerId ?? exp.paidBy;
    const splits = normalizeExpenseSplits(
      exp.amount,
      exp.splits,
      exp.splitBetween,
    );
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
    splits: normalizeExpenseSplits(
      expense.amount,
      expense.splits,
      splitWithIds,
    ),
    date: expense.date,
  };
}

// ─── seed data ────────────────────────────────────────────────────────────────

const contacts: Contact[] = [
  { id: "c1", name: "Anna Kowalska", email: "anna@example.com" },
  { id: "c2", name: "Jan Nowak", email: "jan@example.com" },
  { id: "c3", name: "Marta Wiśniewska", email: "marta@example.com" },
  { id: "c4", name: "Tomasz Zieliński", email: "tomasz@example.com" },
  { id: "c5", name: "Agnieszka Mazur", email: "agnieszka@example.com" },
];

const initialTransactions: Transaction[] = [];

const rawGroups: Group[] = [
  {
    id: "g1",
    name: "Weekend trip",
    memberIds: [SELF_CONTACT_ID, "c1", "c2", "c3"],
    balance: "",
    memberBalances: {},
    inviteCode: "ABC123",
    expenses: [],
    payments: [],
  },
  {
    id: "g2",
    name: "Office lunch",
    memberIds: [SELF_CONTACT_ID, "c2", "c4"],
    balance: "",
    memberBalances: {},
    inviteCode: "XYZ789",
    expenses: [],
    payments: [],
  },
  {
    id: "g3",
    name: "Charity gift",
    memberIds: [SELF_CONTACT_ID, "c1", "c3", "c4"],
    balance: "",
    memberBalances: {},
    inviteCode: "GRP001",
    expenses: [],
    payments: [],
  },
];

rawGroups.forEach(recomputeGroup);

const initialExpenses: Expense[] = rawGroups.flatMap((group) =>
  (group.expenses ?? []).map((expense) =>
    toDashboardExpense(group.id, expense),
  ),
);

// ─── slice ────────────────────────────────────────────────────────────────────

export interface DataState {
  balanceDetails: SummaryItem[];
  expenseDetails: SummaryItem[];
  incomeDetails: SummaryItem[];
  contacts: Contact[];
  groups: Group[];
  expenses: Expense[];
  transactions: Transaction[];
  settledDebts: {
    fromId: string;
    toId: string;
    amount: number;
    groupId: string;
  }[];
}

const initialState: DataState = {
  balanceDetails: [],
  expenseDetails: [],
  incomeDetails: [],
  contacts,
  groups: rawGroups,
  expenses: initialExpenses,
  transactions: initialTransactions,
  settledDebts: [],
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
      if (!group.memberIds.includes(SELF_CONTACT_ID)) {
        group.memberIds.push(SELF_CONTACT_ID);
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
      // zawsze upewnij się że SELF jest w grupie
      if (!memberIds.includes(SELF_CONTACT_ID)) {
        group.memberIds = [SELF_CONTACT_ID, ...memberIds];
      } else {
        group.memberIds = memberIds;
      }
      recomputeGroup(group);
    },

    deleteGroup: (state, action: PayloadAction<string>) => {
      const groupId = action.payload;
      state.groups = state.groups.filter((g) => g.id !== groupId);
      state.expenses = state.expenses.filter((e) => e.groupId !== groupId);
      state.settledDebts = state.settledDebts.filter(
        (d) => d.groupId !== groupId,
      );
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
        if (!group.payments) group.payments = [];
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

      if (!state.settledDebts) state.settledDebts = [];
      state.settledDebts.push({ fromId, toId, amount, groupId });
    },

    removeIncomeDetail: (state, action: PayloadAction<string>) => {
      const label = action.payload;
      state.incomeDetails = state.incomeDetails.filter(
        (item) => item.label !== label,
      );
    },

    removeExpenseDetail: (state, action: PayloadAction<string>) => {
      const label = action.payload;
      state.expenseDetails = state.expenseDetails.filter(
        (item) => item.label !== label,
      );
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
