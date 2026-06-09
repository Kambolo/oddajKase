import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { friendlyError } from "../../lib/authErrors";
import { auth } from "../../lib/firebase";
import MainBtn from "../buttons/MainBtn";
import InputField from "../inputs/InputField";

const googleProvider = new GoogleAuthProvider();

type Props = { onForgot: () => void };

export default function SignInForm({ onForgot }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(friendlyError(err.code));
      }
    } finally {
      setGoogleLoading(false);
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
        className="text-sm font-bold text-accent-dark hover:text-accent-dark/70 transition-colors self-end -mt-1 mr-1 cursor-pointer"
      >
        Forgot password?
      </button>

      <MainBtn
        name={loading ? "Signing in…" : "Sign in"}
        className="w-full mt-1 py-4 text-base rounded-full"
      />

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Google button */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading}
        className="cursor-pointer flex items-center justify-center gap-3 w-full py-4 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {!googleLoading ? (
          <>
            <GoogleIcon />
            Sign in with Google
          </>
        ) : (
          <span className="text-gray-400">Signing in…</span>
        )}
      </button>
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
