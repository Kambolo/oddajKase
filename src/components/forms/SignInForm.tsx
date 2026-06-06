import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { friendlyError } from "../../lib/authErrors";
import { auth } from "../../lib/firebase";
import MainBtn from "../buttons/MainBtn";
import InputField from "../inputs/InputField";

type Props = { onForgot: () => void };

export default function SignInForm({ onForgot }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      <InputField
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <InputField
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

      <button
        type="button"
        onClick={onForgot}
        className="text-sm font-bold text-[#4e635a] hover:text-[#4e635a]/70 transition-colors self-end -mt-1"
      >
        Forgot password?
      </button>

      <MainBtn
        name={loading ? "Signing in…" : "Sign in"}
        className="w-full mt-1 py-4 text-base rounded-2xl"
      />
    </form>
  );
}
