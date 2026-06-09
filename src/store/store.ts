import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { dataSlice } from "./dataSlice";

const STORAGE_KEY = "oddajKase_state";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw);
  } catch (e) {
    // ignore and fallback to undefined
    // eslint-disable-next-line no-console
    console.warn("Failed to load state from localStorage", e);
    return undefined;
  }
}

function saveState(state: any) {
  try {
    // Persist only the data slice to avoid serializing non-serializable parts of other middleware/state.
    const toSave = { data: state.data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    // eslint-disable-next-line no-console
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
