import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, MailWarning, XCircle } from "lucide-react";
import { AxiosError } from "axios";
import { verifyEmailRequest } from "./auth.api";
import { AuthLayout } from "./components/AuthLayout";
import { ResendVerificationForm } from "./components/ResendVerification";

interface VerifyErrorResponse {
  message?: string;
}

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying",
  );
  const [message, setMessage] = useState("");
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!token) {
        if (!cancelled) {
          setStatus("error");
          setMessage("This verification link is missing its token.");
          setShowResend(true);
        }
        return;
      }

      setStatus("verifying");
      setMessage("");
      setShowResend(false);

      try {
        await verifyEmailRequest(token);

        if (cancelled) return;

        setStatus("success");
        setMessage("Your email has been verified. You can now log in.");
      } catch (err) {
        if (cancelled) return;

        const axiosErr = err as AxiosError<VerifyErrorResponse>;
        const errorMessage = axiosErr.response?.data?.message;

        setStatus("error");
        setMessage(errorMessage ?? "We couldn't verify your email. The link may be invalid or expired.");
        setShowResend(true);
      }
    }

    void verify();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const goToLogin = () => {
    navigate("/login", { replace: true });
  };

  return (
    <AuthLayout
      title={
        status === "success"
          ? "Email verified"
          : status === "error"
            ? "Verification failed"
            : "Verify your email"
      }
      footer={
        <Link
          to="/login"
          className="font-medium text-accent hover:underline"
        >
          Return to login
        </Link>
      }
    >
      {status === "verifying" && (
        <div className="flex flex-col items-center text-center">
          <Loader2
            size={28}
            className="mb-4 animate-spin text-accent"
            strokeWidth={1.8}
          />
          <p className="text-sm text-text-secondary">
            Verifying your email address…
          </p>
          <p className="mt-1 text-xs text-text-muted">
            This should only take a moment.
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center">
          <CheckCircle2
            size={38}
            className="mx-auto mb-4 text-accent"
            strokeWidth={1.7}
          />
          <p className="text-sm leading-6 text-text-secondary">{message}</p>

          <button
            type="button"
            onClick={goToLogin}
            className="mt-6 w-full rounded-md bg-accent py-2 text-sm font-medium text-bg transition-opacity duration-150 hover:opacity-90"
          >
            Continue to login
          </button>
        </div>
      )}

      {status === "error" && (
        <div>
          <div className="text-center">
            <XCircle
              size={38}
              className="mx-auto mb-4 text-danger"
              strokeWidth={1.7}
            />
            <p className="text-sm leading-6 text-text-secondary">{message}</p>
          </div>

          {showResend && (
            <div className="mt-6 rounded-md border border-border bg-bg-subtle p-4">
              <div className="mb-3 flex items-start gap-2">
                <MailWarning
                  size={17}
                  className="mt-0.5 shrink-0 text-accent"
                  strokeWidth={1.8}
                />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Need a new verification link?
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-text-secondary">
                    Enter your registered email and we'll send another link.
                  </p>
                </div>
              </div>

              <ResendVerificationForm />
            </div>
          )}
        </div>
      )}
    </AuthLayout>
  );
}
