import { SELF_CONTACT_ID, SELF_CONTACT_LABEL } from "../lib/self";
import type { Contact, Expense, Group, SummaryItem } from "../lib/types";

type PersonalSummary = {
  balanceTotal: number;
  expenseTotal: number;
  incomeTotal: number;
  balanceDetails: SummaryItem[];
  expenseDetails: SummaryItem[];
  incomeDetails: SummaryItem[];
};

const roundMoney = (value: number) => parseFloat(value.toFixed(2));

const contactName = (contacts: Contact[], id: string) => {
  if (id === SELF_CONTACT_ID) return SELF_CONTACT_LABEL;
  return contacts.find((contact) => contact.id === id)?.name ?? "Unknown";
};

const groupName = (groups: Group[], id: string) =>
  groups.find((group) => group.id === id)?.name ?? "Group";

export function buildPersonalSummary(
  expenses: Expense[],
  groups: Group[],
  contacts: Contact[],
  currentContactId: string | null,
): PersonalSummary {
  if (!currentContactId) {
    return {
      balanceTotal: 0,
      expenseTotal: 0,
      incomeTotal: 0,
      balanceDetails: [],
      expenseDetails: [],
      incomeDetails: [],
    };
  }

  const balancesByPerson: Record<string, number> = {};
  const expenseDetails: SummaryItem[] = [];
  const incomeDetails: SummaryItem[] = [];

  for (const expense of expenses) {
    const mySplit =
      expense.splits.find((split) => split.contactId === currentContactId)?.amount ??
      0;

    if (expense.payerId === currentContactId) {
      for (const split of expense.splits) {
        if (split.contactId === currentContactId) continue;
        balancesByPerson[split.contactId] =
          (balancesByPerson[split.contactId] ?? 0) + split.amount;
        incomeDetails.push({
          label: contactName(contacts, split.contactId),
          amount: roundMoney(split.amount),
          meta: `${expense.name} in ${groupName(groups, expense.groupId)}`,
        });
      }
    } else if (mySplit > 0) {
      balancesByPerson[expense.payerId] =
        (balancesByPerson[expense.payerId] ?? 0) - mySplit;
      expenseDetails.push({
        label: expense.name,
        amount: roundMoney(-mySplit),
        meta: `to ${contactName(contacts, expense.payerId)}`,
      });
    }
  }

  const balanceDetails = Object.entries(balancesByPerson).map(([id, amount]) => ({
    label: contactName(contacts, id),
    amount: roundMoney(amount),
    meta: amount < 0 ? "You owe" : "Owes you",
  }));

  const expenseTotal = roundMoney(
    expenseDetails.reduce((sum, item) => sum + Math.abs(item.amount), 0),
  );
  const incomeTotal = roundMoney(
    incomeDetails.reduce((sum, item) => sum + item.amount, 0),
  );

  return {
    balanceTotal: roundMoney(incomeTotal - expenseTotal),
    expenseTotal,
    incomeTotal,
    balanceDetails,
    expenseDetails,
    incomeDetails,
  };
}
