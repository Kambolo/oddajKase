import ForgotPasswordForm from "../components/forms/ForgotPasswordForm";
import RegisterForm from "../components/forms/RegisterForm";
import SignInForm from "../components/forms/SignInForm";
import AuthLayout from "../components/layout/auth/AuthLayout";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { initGoogleAnalytics, trackPageView } from "../lib/googleAnalytics";

type AuthPageProps = {
  initialMode?: "signin" | "register" | "forgot";
};

const headings = {
  signin: { title: "Welcome back", sub: "Sign in to continue to OddajKase" },
  register: {
    title: "Create account",
    sub: "Start splitting expenses with ease",
  },
  forgot: { title: "Forgot password?", sub: "No worries, we'll sort it out" },
};

export default function AuthPage({ initialMode = "signin" }: AuthPageProps) {
  const location = useLocation();

  useEffect(() => {
    initGoogleAnalytics();
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <AuthLayout initialMode={initialMode}>
      {(mode, setMode) => {
        const { title, sub } = headings[mode];
        return (
          <>
            <div className="flex flex-col gap-1 mb-6">
              <h2 className="text-[26px] font-bold tracking-[-0.5px] leading-[1.3] text-text">
                {title}
              </h2>
              <p className="text-sm font-semibold text-[#56615f]">{sub}</p>
            </div>

            {mode === "signin" && (
              <SignInForm onForgot={() => setMode("forgot")} />
            )}
            {mode === "register" && <RegisterForm />}
            {mode === "forgot" && (
              <ForgotPasswordForm onBack={() => setMode("signin")} />
            )}
          </>
        );
      }}
    </AuthLayout>
  );
}
