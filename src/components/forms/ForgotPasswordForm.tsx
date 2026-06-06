import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { auth } from "../../lib/firebase";
import MainBtn from "../buttons/MainBtn";
import InputField from "../inputs/InputField";

type Props = {
  onBack: () => void;
};

export default function ForgotPasswordForm({ onBack }: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: any) {
      console.log(err.code);
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-6 py-2 text-center">
        <div className="w-14 h-14 rounded-full bg-[#d1e8dd] flex items-center justify-center text-2xl">
          ✉️
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-base font-bold text-[#1b1c1a]">Check your inbox</p>
          <p className="text-sm text-[#56615f] leading-relaxed">
            We sent a reset link to{" "}
            <span className="font-bold text-[#4e635a]">{email}</span>.<br />
            It may take a minute to arrive.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-bold text-[#4e635a] hover:text-[#4e635a]/70 transition-colors"
        >
          ← Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      <InputField
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <MainBtn
        name="Send reset link"
        className="w-full mt-1 py-4 text-base rounded-2xl"
      />

      <button
        type="button"
        onClick={onBack}
        className="text-sm font-bold text-[#71717a] hover:text-[#1b1c1a] transition-colors text-center"
      >
        ← Back to sign in
      </button>
    </form>
  );
}
