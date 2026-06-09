import { useEffect, useMemo, useState } from "react";
import Modal from "../common/Modal";

type Contact = {
  id: string;
  name: string;
  email: string;
};

type Group = {
  id: string;
  name: string;
  memberIds: string[];
};

type Props = {
  open: boolean;
  groups: Group[];
  contacts: Contact[];
  onClose: () => void;
  onSave: (data: {
    name: string;
    amount: string;
    category: string;
    groupId: string;
    personId: string;
  }) => void;
};

export default function NewExpenseModal({
  open,
  groups,
  contacts,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.id ?? "");
  const [selectedPerson, setSelectedPerson] = useState("");

  const groupMembers = useMemo(() => {
    const group = groups.find((item) => item.id === selectedGroup);
    return group
      ? group.memberIds
          .map((memberId) =>
            contacts.find((contact) => contact.id === memberId),
          )
          .filter((contact): contact is Contact => Boolean(contact))
      : [];
  }, [groups, contacts, selectedGroup]);

  useEffect(() => {
    if (
      groupMembers.length &&
      !groupMembers.some((member) => member.id === selectedPerson)
    ) {
      setSelectedPerson(groupMembers[0].id);
    }
  }, [groupMembers, selectedPerson]);

  useEffect(() => {
    if (!selectedGroup && groups.length) {
      setSelectedGroup(groups[0].id);
    }
  }, [groups, selectedGroup]);

  const handleSave = () => {
    if (!name || !amount || !selectedGroup || !selectedPerson) return;
    onSave({
      name,
      amount,
      category,
      groupId: selectedGroup,
      personId: selectedPerson,
    });
    setName("");
    setAmount("");
    setCategory("");
    setSelectedGroup(groups[0]?.id ?? "");
    setSelectedPerson("");
    onClose();
  };

  return (
    <Modal
      open={open}
      title="New expense"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-accent-dark px-5 py-2 text-sm font-semibold text-white hover:bg-accent-dark/90 cursor-pointer transition-all"
          >
            Save expense
          </button>
        </div>
      }
    >
      <div className="grid gap-5">
        <label className="grid gap-2 text-sm text-slate-700">
          Title
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Coffee, groceries..."
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary"
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-700">
          Amount
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="€25.00"
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary"
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-700">
          Group
          <select
            value={selectedGroup}
            onChange={(event) => setSelectedGroup(event.target.value)}
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary"
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-slate-700">
          Person
          <select
            value={selectedPerson}
            onChange={(event) => setSelectedPerson(event.target.value)}
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary"
          >
            {groupMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-slate-700">
          Category
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Transport, Food..."
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary"
          />
        </label>
      </div>
    </Modal>
  );
}
