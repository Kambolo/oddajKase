export type Contact = {
  id: string;
  name: string;
  email: string;
};

export type Group = {
  id: string;
  name: string;
  balance: string;
  memberIds: string[];
  memberBalances?: Record<string, number>;
  inviteCode?: string;
};

// type Group = {
//   id: string;
//   name: string;
//   balance: string;
//   memberIds: string[];
//   memberBalances: Record<string, number>;
// };

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
