export type Contact = {
  id: string;
  name: string;
  email: string;
};


export type GroupExpense = {
  id: string;
  title: string;
  amount: number;
  paidBy: string; // contact id
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

export type SummaryCard = {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  description: string;
  details: SummaryItem[];
};
