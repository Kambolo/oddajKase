import { useState } from "react";
import Modal from "../common/Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (groupName: string, inviteCode: string) => void;
};

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function AddGroupModal({ open, onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [createdName, setCreatedName] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCreate = () => {
    if (!name.trim()) return;
    const code = generateCode();
    setCreatedName(name.trim());
    setCreatedCode(code);
    onCreate(name.trim(), code);
  };

  const handleCopy = () => {
    if (!createdCode) return;
    navigator.clipboard.writeText(createdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setName("");
    setCreatedCode(null);
    setCreatedName("");
    setCopied(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      title={createdCode ? "Group created!" : "Add group"}
      onClose={handleClose}
      footer={
        createdCode ? (
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90 cursor-pointer transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full border border-slate-300 px-5 py-3 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!name.trim()}
              className="text-text-light transition-all hover:bg-accent-dark/90 items-center justify-center rounded-full bg-accent-dark px-5 py-3 text-sm font-semibold  hover:bg-primary/90 cursor-pointer"
            >
              Create group
            </button>
          </div>
        )
      }
    >
      {createdCode ? (
        <div className="grid gap-5">
          <p className="text-sm text-slate-600">
            Share this code with people you want to invite to{" "}
            <span className="font-semibold text-slate-800">{createdName}</span>.
          </p>
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-slate-50 border border-slate-200 px-6 py-8">
            <div className="text-xs uppercase tracking-widest text-slate-400">
              Invite code
            </div>
            <div className="text-4xl font-bold tracking-[0.2em] text-primary font-mono">
              {createdCode}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="mt-1 rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary hover:bg-primary/10 cursor-pointer transition-all"
            >
              {copied ? "Copied!" : "Copy code"}
            </button>
          </div>
          <p className="text-xs text-slate-400 text-center">
            This code is also shown on the group card.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          <label className="grid gap-2 text-sm text-slate-700">
            Group name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Weekend trip"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary"
            />
          </label>
          <p className="text-sm text-slate-500 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
            After creating the group you'll receive an invite code to share with
            others.
          </p>
        </div>
      )}
    </Modal>
  );
}
