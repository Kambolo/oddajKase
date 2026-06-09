export type Contact = {
  id: string;
  name: string;
  email: string;
};

export type ExpenseSplit = {
  contactId: string;
  amount: number;
};

export type GroupExpense = {
  id: string;
  name?: string;
  title: string;
  amount: number;
  category?: string;
  groupId?: string;
  payerId?: string;
  paidBy: string; // contact id
  splitMode?: "equal" | "amount" | "percent";
  splitWithIds?: string[];
  splits?: ExpenseSplit[];
  splitBetween: string[]; // contact ids
  date: string;
};

export type GroupPayment = {
  id: string;
  from: string; // contact id
  to: string; // contact id
  amount: number;
  date: string;
};

export type Group = {
  id: string;
  name: string;
  balance: string;
  memberIds: string[];
  memberBalances?: Record<string, number>;
  inviteCode?: string;
  expenses?: GroupExpense[];
  payments?: GroupPayment[];
};

export interface Transaction {
  id: string;
  title: string;
  amount: string;
  date: string;
}

export type SummaryItem = {
  label: string;
  amount: number;
  meta?: string;
};

export type Expense = {
  id: string;
  name: string;
  amount: number;
  category: string;
  groupId: string;
  payerId: string;
  splitMode: "equal" | "amount" | "percent";
  splitWithIds: string[];
  splits: ExpenseSplit[];
  date: string;
};

export type SummaryCard = {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  description: string;
  details: SummaryItem[];
};
