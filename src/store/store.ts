import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { DataState } from "./dataSlice";
import { dataSlice } from "./dataSlice";

const STORAGE_KEY = "oddajKase_state";

type PersistedState = {
  data: DataState;
};

function loadState(): PersistedState | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as PersistedState;

    if (parsed?.data) {
      if (!Array.isArray(parsed.data.settledDebts)) {
        parsed.data.settledDebts = [];
      }
      for (const group of parsed.data.groups ?? []) {
        if (!Array.isArray(group.payments)) group.payments = [];
        if (!Array.isArray(group.expenses)) group.expenses = [];
        if (!group.memberBalances) group.memberBalances = {};
      }
    }

    return parsed;
  } catch (e) {
    console.warn("Failed to load state from localStorage", e);
    return undefined;
  }
}

function saveState(state: PersistedState) {
  try {
    const toSave: PersistedState = { data: state.data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn("Failed to save state to localStorage", e);
  }
}

const preloadedState = loadState();

export const store = configureStore({
  reducer: {
    data: dataSlice.reducer,
  },
  preloadedState,
});

let saveTimer: ReturnType<typeof setTimeout> | null = null;
store.subscribe(() => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveState(store.getState()), 300);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
