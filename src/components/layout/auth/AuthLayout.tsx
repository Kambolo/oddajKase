import { useEffect, useState } from "react";

export type AuthMode = "signin" | "register" | "forgot";

type AuthLayoutProps = {
  initialMode?: AuthMode;
  children: (mode: AuthMode, setMode: (m: AuthMode) => void) => React.ReactNode;
};

export default function AuthLayout({
  initialMode = "signin",
  children,
}: AuthLayoutProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#f0ede8] px-4 py-12">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-[#c8ddd4] opacity-40 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[520px] h-[520px] rounded-full bg-[#d1e8dd] opacity-30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#e8e4dc] opacity-50 blur-3xl" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-[480px] bg-white rounded-[40px] shadow-[0_20px_80px_-15px_rgba(0,0,0,0.18)] overflow-hidden">
        {/* Top: app name + toggle (hidden on forgot) */}
        <div className="px-10 pt-10 pb-8 flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-2xl font-bold text-[#8da399] tracking-tight">
              OddajKase
            </span>
            <span className="text-[11px] font-semibold text-[#a8b5b0] tracking-[0.15em] uppercase">
              Calm Finance
            </span>
          </div>

          {mode !== "forgot" && (
            <AuthToggle
              mode={mode as "signin" | "register"}
              onChange={setMode}
            />
          )}

          {mode === "forgot" && (
            <div className="w-full text-center mt-3">
              <span className="text-2xl font-bold text-[#56615f]">
                Reset password
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-[#e3e2df] mx-10" />

        {/* Form slot */}
        <div className="px-10 py-8">{children(mode, setMode)}</div>
      </div>
    </div>
  );
}

type ToggleProps = {
  mode: "signin" | "register";
  onChange: (mode: AuthMode) => void;
};

function AuthToggle({ mode, onChange }: ToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-[#f4f3f0] p-1 rounded-full w-full">
      {(["signin", "register"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`
            flex-1 py-2.5 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer
            ${
              mode === m
                ? "bg-white text-text shadow-[0_1px_4px_rgba(0,0,0,0.10)]"
                : "text-[#71717a] hover:text-text"
            }
          `}
        >
          {m === "signin" ? "Sign in" : "Register"}
        </button>
      ))}
    </div>
  );
}
