import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { friendlyError } from "../../lib/authErrors";
import { auth } from "../../lib/firebase";
import MainBtn from "../buttons/MainBtn";
import InputField from "../inputs/InputField";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
};

type PasswordRule = {
  label: string;
  test: (v: string) => boolean;
};

const PASSWORD_RULES: PasswordRule[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One number", test: (v) => /[0-9]/.test(v) },
  { label: "One special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

function validate(
  name: string,
  email: string,
  password: string,
  confirm: string,
): FieldErrors {
  const errors: FieldErrors = {};

  if (name.trim().length < 5)
    errors.name = "Name must be at least 5 characters.";

  if (!email.includes("@") || !email.includes("."))
    errors.email = "Enter a valid email address.";

  const failedRules = PASSWORD_RULES.filter((r) => !r.test(password));
  if (failedRules.length > 0)
    errors.password = failedRules.map((r) => r.label).join(", ") + ".";

  if (password !== confirm) errors.confirm = "Passwords don't match.";

  return errors;
}

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [firebaseError, setFirebaseError] = useState("");

  const touch = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = {
      name: true,
      email: true,
      password: true,
      confirm: true,
    };
    setTouched(allTouched);
    const errs = validate(name, email, password, confirm);
    if (Object.keys(errs).length > 0) return;

    setFirebaseError("");
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(user, { displayName: name });
    } catch (err: any) {
      setFirebaseError(friendlyError(err.code));
      setName("");
      setEmail("");
      setPassword("");
      setConfirm("");
      setTouched({});
    }
  };

  const liveErrors = touched ? validate(name, email, password, confirm) : {};

  const err = (field: keyof FieldErrors) =>
    touched[field] ? liveErrors[field] : undefined;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      <InputField
        label="Full name"
        type="text"
        placeholder="Jan Kowalski"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => touch("name")}
        error={err("name")}
        hint="Minimum 5 characters"
      />

      <InputField
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => touch("email")}
        error={err("email")}
      />

      <div className="flex flex-col gap-2">
        <InputField
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => touch("password")}
          error={err("password")}
        />
        {/* Password strength checklist */}
        {password.length > 0 && (
          <ul className="flex flex-col gap-1 pl-1 mt-1">
            {PASSWORD_RULES.map((rule) => {
              const ok = rule.test(password);
              return (
                <li
                  key={rule.label}
                  className={`flex items-center gap-2 text-xs font-semibold transition-colors duration-200 ${
                    ok ? "text-[#4e635a]" : "text-[#a8b5b0]"
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] transition-all duration-200 ${
                      ok
                        ? "bg-[#d1e8dd] text-[#4e635a]"
                        : "bg-[#f4f3f0] text-[#c2c8c4]"
                    }`}
                  >
                    {ok ? "✓" : "·"}
                  </span>
                  {rule.label}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <InputField
        label="Confirm password"
        type="password"
        placeholder="••••••••"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        onBlur={() => touch("confirm")}
        error={err("confirm")}
      />

      {firebaseError && (
        <p className="text-sm font-semibold text-red-500">{firebaseError}</p>
      )}

      <MainBtn
        name="Create account"
        className="w-full mt-1 py-4 text-base rounded-full"
      />
    </form>
  );
}
