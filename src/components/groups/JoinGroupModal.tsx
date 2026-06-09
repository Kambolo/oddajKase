import { useState } from "react";
import Modal from "../common/Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  onJoin: (inviteCode: string) => "ok" | "not_found" | "already_joined";
};

export default function JoinGroupModal({ open, onClose, onJoin }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [joinedGroupName, setJoinedGroupName] = useState<string | null>(null);

  const handleJoin = () => {
    const result = onJoin(code.trim().toUpperCase());
    if (result === "not_found") {
      setError("No group found with this code. Please check and try again.");
    } else if (result === "already_joined") {
      setError("You're already a member of this group.");
    } else {
      setJoinedGroupName(code.trim().toUpperCase());
    }
  };

  const handleClose = () => {
    setCode("");
    setError("");
    setJoinedGroupName(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      title={joinedGroupName ? "You're in!" : "Join a group"}
      onClose={handleClose}
      footer={
        joinedGroupName ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90 cursor-pointer transition-all"
            >
              Go to group
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
              onClick={handleJoin}
              disabled={!code.trim()}
              className="text-text-light transition-all hover:bg-accent-dark/90 items-center justify-center rounded-full bg-accent-dark px-5 py-3 text-sm font-semibold  hover:bg-primary/90 cursor-pointer"
            >
              Join group
            </button>
          </div>
        )
      }
    >
      {joinedGroupName ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-emerald-50 border border-emerald-200 px-6 py-8 text-center">
          <div className="text-4xl">🎉</div>
          <div className="text-sm text-slate-500">
            You've successfully joined the group. Shared expenses will appear
            here.
          </div>
        </div>
      ) : (
        <div className="grid gap-5">
          <p className="text-sm text-slate-500">
            Ask the group creator for their invite code, then enter it below.
          </p>
          <label className="grid gap-2 text-sm text-slate-700">
            Invite code
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError("");
              }}
              placeholder="e.g. ABC123"
              maxLength={10}
              className={`rounded-2xl border bg-slate-50 px-4 py-3 text-center text-xl font-mono tracking-widest uppercase outline-none transition-colors ${
                error
                  ? "border-rose-400 focus:border-rose-500"
                  : "border-slate-200 focus:border-primary"
              }`}
            />
          </label>
          {error && (
            <p className="text-sm text-rose-600 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3">
              {error}
            </p>
          )}
          <p className="text-xs text-slate-400">
            Demo codes from existing groups:{" "}
            <span className="font-mono font-semibold">ABC123</span>,{" "}
            <span className="font-mono font-semibold">XYZ789</span>,{" "}
            <span className="font-mono font-semibold">GRP001</span>
          </p>
        </div>
      )}
    </Modal>
  );
}
