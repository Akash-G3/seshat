import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState } from "react";
import { CheckCircle2, MailCheck } from "lucide-react";
import { loginSchema, type LoginInput } from "./auth.schema";
import { loginRequest } from "./auth.api";
import { useAuth } from "@app/AuthContext";
import { getMyWorkspace } from "@features/workspace/api/workspace.api";
import { AuthLayout } from "./components/AuthLayout";
import { FormField } from "./components/FormField";
import { ResendVerificationForm } from "./components/ResendVerification";
import type { AxiosError } from "axios";

interface LoginLocationState {
  message?: string;
  verificationEmail?: string;
}

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setWorkspace } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [showVerificationHelp, setShowVerificationHelp] = useState(false);

  const locationState = location.state as LoginLocationState | null;
  const handoffMessage = locationState?.message;
  const handoffEmail = locationState?.verificationEmail;

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    setShowVerificationHelp(false);
    setIsSubmittingLogin(true);

    try {
      await loginRequest(data);
      const workspace = await getMyWorkspace();
      setWorkspace(workspace);
      navigate("/workspace", { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const status = axiosErr.response?.status;
      const message = axiosErr.response?.data?.message;

      if (status === 403) {
        setServerError(
          message ?? "Please verify your email before logging in.",
        );
        setShowVerificationHelp(true);
      } else {
        setServerError(message ?? "Login failed. Try again.");
      }
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const resendEmail = handoffEmail ?? getValues("email");

  return (
    <AuthLayout
      title="Log in to Seshat"
      footer={
        <p>
          New here?{" "}
          <Link
            to="/signup"
            className="group font-medium text-accent hover:underline"
          >
            Sign up
            <span className="ml-0.5 inline-block transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </p>
      }
    >
      {handoffMessage && (
        <div className="mb-5 flex items-start gap-2 rounded-md bg-accent-subtle px-3 py-2.5 text-sm text-accent">
          <CheckCircle2
            size={16}
            className="mt-0.5 shrink-0"
            strokeWidth={1.8}
          />
          <span>{handoffMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        {serverError && <p className="text-sm text-danger">{serverError}</p>}

        {showVerificationHelp && (
          <div className="rounded-md border border-border bg-bg-subtle p-3">
            <div className="mb-2 flex items-start gap-2">
              <MailCheck
                size={17}
                className="mt-0.5 shrink-0 text-accent"
                strokeWidth={1.8}
              />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Email verification required
                </p>
                <p className="mt-0.5 text-xs leading-5 text-text-secondary">
                  Use the email you registered with to receive a new verification
                  link.
                </p>
              </div>
            </div>

            <ResendVerificationForm initialEmail={resendEmail} />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmittingLogin}
          className="w-full rounded-md bg-accent py-2 text-sm font-medium text-bg transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
        >
          {isSubmittingLogin ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}
