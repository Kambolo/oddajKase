import { useMemo, useState } from "react";
import { SELF_CONTACT_ID, SELF_CONTACT_LABEL } from "../../lib/self";
import type { Contact, ExpenseSplit, Group } from "../../lib/types";
import { formatMoney } from "../../util/utils";
import Modal from "../common/Modal";

type SplitMode = "equal" | "amount" | "percent";

type Props = {
  open: boolean;
  groups: Group[];
  contacts: Contact[];
  currentContactId: string | null;
  onClose: () => void;
  onSave: (data: {
    name: string;
    amount: string;
    category: string;
    groupId: string;
    payerId: string;
    splitMode: SplitMode;
    splitWithIds: string[];
    splits: ExpenseSplit[];
  }) => void;
};

const roundMoney = (value: number) => parseFloat(value.toFixed(2));

const splitEqual = (amount: number, ids: string[]) => {
  const baseCents = Math.floor((amount * 100) / ids.length);
  let remainingCents = Math.round(amount * 100) - baseCents * ids.length;

  return ids.map((contactId) => {
    const cents = baseCents + (remainingCents > 0 ? 1 : 0);
    if (remainingCents > 0) remainingCents -= 1;
    return { contactId, amount: cents / 100 };
  });
};

export default function NewExpenseModal({
  open,
  groups,
  contacts,
  currentContactId,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("General");
  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [payerId, setPayerId] = useState(currentContactId ?? SELF_CONTACT_ID);
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [splitWithIds, setSplitWithIds] = useState<string[]>([SELF_CONTACT_ID]);
  const [manualValues, setManualValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const people = useMemo(
    () => [
      { id: SELF_CONTACT_ID, name: SELF_CONTACT_LABEL, email: "Account owner" },
      ...contacts,
    ],
    [contacts],
  );
  const selectedGroup = groups.find((group) => group.id === groupId);
  const groupPeople = useMemo(() => {
    if (!selectedGroup) return people;
    const allowed = new Set([SELF_CONTACT_ID, ...selectedGroup.memberIds]);
    return people.filter((person) => allowed.has(person.id));
  }, [people, selectedGroup]);
  const groupPeopleIds = useMemo(
    () => new Set(groupPeople.map((person) => person.id)),
    [groupPeople],
  );
  const activePayerId = groupPeopleIds.has(payerId)
    ? payerId
    : (currentContactId ?? SELF_CONTACT_ID);
  const selectedSplitWithIds = useMemo(() => {
    const activeIds = splitWithIds.filter((id) => groupPeopleIds.has(id));
    return activeIds.length > 0 ? activeIds : [SELF_CONTACT_ID];
  }, [groupPeopleIds, splitWithIds]);

  const numericAmount = Number.parseFloat(amount.replace(/[^0-9.-]/g, ""));
  const safeAmount = Number.isFinite(numericAmount)
    ? Math.abs(numericAmount)
    : 0;

  const splits = useMemo<ExpenseSplit[]>(() => {
    if (selectedSplitWithIds.length === 0 || safeAmount <= 0) return [];
    if (splitMode === "equal")
      return splitEqual(safeAmount, selectedSplitWithIds);
    if (splitMode === "percent") {
      return selectedSplitWithIds.map((contactId) => ({
        contactId,
        amount: roundMoney(
          (safeAmount *
            (Number.parseFloat(manualValues[contactId] ?? "0") || 0)) /
            100,
        ),
      }));
    }
    return selectedSplitWithIds.map((contactId) => ({
      contactId,
      amount: roundMoney(
        Number.parseFloat(manualValues[contactId] ?? "0") || 0,
      ),
    }));
  }, [manualValues, safeAmount, selectedSplitWithIds, splitMode]);

  const splitTotal = roundMoney(
    splits.reduce((sum, split) => sum + split.amount, 0),
  );
  const percentTotal = selectedSplitWithIds.reduce(
    (sum, id) => sum + (Number.parseFloat(manualValues[id] ?? "0") || 0),
    0,
  );

  const toggleSplit = (id: string) => {
    setSplitWithIds((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id],
    );
  };

  const resetForm = () => {
    setName("");
    setAmount("");
    setCategory("General");
    setSplitMode("equal");
    setSplitWithIds([SELF_CONTACT_ID]);
    setManualValues({});
    setError("");
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    if (!name.trim()) return setError("Enter an expense name.");
    if (!groupId) return setError("Choose a group.");
    if (safeAmount <= 0) return setError("Enter an amount greater than zero.");
    if (splitMode === "percent" && Math.abs(percentTotal - 100) > 0.01) {
      return setError("Percentages must add up to 100%.");
    }
    if (splitMode === "amount" && Math.abs(splitTotal - safeAmount) > 0.01) {
      return setError(
        "Manual split amounts must add up to the expense amount.",
      );
    }

    onSave({
      name: name.trim(),
      amount: String(safeAmount),
      category: category.trim() || "General",
      groupId,
      payerId: activePayerId,
      splitMode,
      splitWithIds: selectedSplitWithIds,
      splits,
    });
    resetForm();
    onClose();
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      title="Add expense"
      onClose={handleCancel}
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500 sm:mr-auto">
            Split total: {formatMoney(splitTotal)}
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-full bg-accent-dark px-5 py-2 text-sm font-semibold text-text-light hover:bg-accent-dark/90 cursor-pointer transition-all"
            >
              Save expense
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-3xl bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-3xl border border-slate-200 px-4 py-3 text-slate-900"
            placeholder="Expense name"
          />
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="rounded-3xl border border-slate-200 px-4 py-3 text-slate-900"
            inputMode="decimal"
            placeholder="Amount"
          />
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-3xl border border-slate-200 px-4 py-3 text-slate-900"
            placeholder="Category"
          />
          <div className="relative">
            <select
              value={groupId}
              onChange={(event) => setGroupId(event.target.value)}
              className="w-full appearance-none rounded-3xl border border-slate-200 px-4 py-3 pr-10 text-slate-900"
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              ▾
            </span>
          </div>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Paid by
          <div className="relative mt-2">
            <select
              value={activePayerId}
              onChange={(event) => setPayerId(event.target.value)}
              className="w-full appearance-none rounded-3xl border border-slate-200 px-4 py-3 pr-10 text-slate-900"
            >
              {groupPeople.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              ▾
            </span>
          </div>
        </label>

        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-700">Split with</div>
          <div className="grid gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-3">
            {groupPeople.map((person) => (
              <label
                key={person.id}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-3xl px-4 py-3 hover:bg-slate-100"
              >
                <span>
                  <span className="block font-medium text-slate-900">
                    {person.name}
                  </span>
                  <span className="block text-sm text-slate-500">
                    {person.email}
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={selectedSplitWithIds.includes(person.id)}
                  onChange={() => toggleSplit(person.id)}
                  className="h-4 w-4 rounded-xl border-slate-300 text-primary focus:ring-primary"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            ["equal", "Equal"],
            ["amount", "Amounts"],
            ["percent", "Percent"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setSplitMode(value as SplitMode)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent-dark focus:ring-offset-2 cursor-pointer transition-all ${
                splitMode === value
                  ? "border-accent-dark bg-accent-dark text-text-light hover:bg-accent-dark/90"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {splitMode !== "equal" && (
          <div className="space-y-2">
            {selectedSplitWithIds.map((id) => {
              const person = people.find((item) => item.id === id);
              return (
                <label
                  key={id}
                  className="grid grid-cols-[1fr_120px] items-center gap-3 rounded-full border border-slate-200 pl-6 pr-3 py-3"
                >
                  <span className="font-medium text-slate-900">
                    {person?.name ?? "Unknown"}
                  </span>
                  <input
                    value={manualValues[id] ?? ""}
                    onChange={(event) =>
                      setManualValues((values) => ({
                        ...values,
                        [id]: event.target.value,
                      }))
                    }
                    className="rounded-full border border-slate-200 px-3 py-2 text-right text-slate-900"
                    inputMode="decimal"
                    placeholder={splitMode === "percent" ? "0%" : "0.00"}
                  />
                </label>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
