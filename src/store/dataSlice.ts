import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { Contact, Group, SummaryItem } from "../lib/types";

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

const contacts: Contact[] = [
  { id: "c1", name: "Anna Kowalska", email: "anna@example.com" },
  { id: "c2", name: "Jan Nowak", email: "jan@example.com" },
  { id: "c3", name: "Marta Wiśniewska", email: "marta@example.com" },
  { id: "c4", name: "Tomasz Zieliński", email: "tomasz@example.com" },
  { id: "c5", name: "Agnieszka Mazur", email: "agnieszka@example.com" },
];

const groups: Group[] = [
  {
    id: "g1",
    name: "Weekend trip",
    memberIds: ["c1", "c2", "c3"],
    balance: "€260.50",
    memberBalances: { c1: -40.5, c2: 20.0, c3: 20.5 },
    inviteCode: "ABC123",
  },
  {
    id: "g2",
    name: "Office lunch",
    memberIds: ["c2", "c4"],
    balance: "€-70.20",
    memberBalances: { c2: -35.1, c4: -35.1 },
    inviteCode: "XYZ789",
  },
  {
    id: "g3",
    name: "Charity gift",
    memberIds: ["c1", "c3", "c4"],
    balance: "€120.00",
    memberBalances: { c1: 40.0, c3: 40.0, c4: 40.0 },
    inviteCode: "GRP001",
  },
];

interface DataState {
  balanceDetails: SummaryItem[];
  expenseDetails: SummaryItem[];
  incomeDetails: SummaryItem[];
  contacts: Contact[];
  groups: Group[];
}

const initialState: DataState = {
  balanceDetails,
  expenseDetails,
  incomeDetails,
  contacts,
  groups,
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
        memberIds: [],
        memberBalances: {},
        inviteCode,
      };
      state.groups.unshift(newGroup);
    },
    joinGroup: (state, action: PayloadAction<{ inviteCode: string }>) => {
      const { inviteCode } = action.payload;
      const group = state.groups.find(
        (g) => g.inviteCode?.toUpperCase() === inviteCode.toUpperCase(),
      );
      if (!group) return;
      // In a real app we'd add the current user; here we just mark it joined
      // by adding a mock "you" member id if not already present
      if (!group.memberIds.includes("me")) {
        group.memberIds.push("me");
        if (group.memberBalances) {
          group.memberBalances["me"] = 0;
        }
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
      group.memberBalances = memberIds.reduce(
        (acc, id) => {
          acc[id] = group.memberBalances?.[id] ?? 0;
          return acc;
        },
        {} as Record<string, number>,
      );
    },
    deleteGroup: (state, action: PayloadAction<string>) => {
      state.groups = state.groups.filter((g) => g.id !== action.payload);
    },
  },
});

export const { addGroup, updateGroupMembers, deleteGroup, joinGroup } =
  dataSlice.actions;
export default dataSlice.reducer;
