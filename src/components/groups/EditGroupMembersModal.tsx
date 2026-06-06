import Modal from "../common/Modal";

type Contact = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  open: boolean;
  groupName: string;
  contacts: Contact[];
  memberIds: string[];
  onClose: () => void;
  onSave: (memberIds: string[]) => void;
};

export default function EditGroupMembersModal({
  open,
  groupName,
  contacts,
  memberIds,
  onClose,
  onSave,
}: Props) {
  const toggleContact = (id: string) => {
    const next = memberIds.includes(id)
      ? memberIds.filter((item) => item !== id)
      : [...memberIds, id];
    onSave(next);
  };

  return (
    <Modal
      open={open}
      title={`Edit ${groupName} members`}
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90"
        >
          Done
        </button>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">Toggle members from your contact list. Checked contacts are included in this group.</p>
        <div className="grid gap-2 max-h-72 overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50 p-3">
          {contacts.map((contact) => (
            <label
              key={contact.id}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-3xl px-4 py-3 transition hover:bg-slate-100"
            >
              <div>
                <div className="font-medium text-slate-900">{contact.name}</div>
                <div className="text-sm text-slate-500">{contact.email}</div>
              </div>
              <input
                type="checkbox"
                checked={memberIds.includes(contact.id)}
                onChange={() => toggleContact(contact.id)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
            </label>
          ))}
        </div>
      </div>
    </Modal>
  );
}
