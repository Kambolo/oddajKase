import { useState } from "react";
import Modal from "../common/Modal";

type Contact = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  open: boolean;
  contacts: Contact[];
  onClose: () => void;
  onCreate: (groupName: string, memberIds: string[]) => void;
};

export default function AddGroupModal({
  open,
  contacts,
  onClose,
  onCreate,
}: Props) {
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleContact = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), selectedIds);
    setName("");
    setSelectedIds([]);
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Add group"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="rounded-full bg-[#4E635A] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3f5149]"
          >
            Create group
          </button>
        </div>
      }
    >
      <div className="grid gap-5">
        <label className="grid gap-2 text-sm text-slate-700">
          Group name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Weekend trip"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary"
          />
        </label>
        <div>
          <div className="mb-3 text-sm font-semibold text-slate-800">
            Add people from contacts
          </div>
          <div className="grid gap-2 max-h-64 overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50 p-3">
            {contacts.map((contact) => (
              <label
                key={contact.id}
                className="flex cursor-pointer items-center gap-3 rounded-3xl px-4 py-3 transition hover:bg-slate-100"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(contact.id)}
                  onChange={() => toggleContact(contact.id)}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <div>
                  <div className="font-medium text-slate-900">
                    {contact.name}
                  </div>
                  <div className="text-sm text-slate-500">{contact.email}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
