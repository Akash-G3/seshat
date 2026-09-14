import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { AxiosError } from "axios";
import { resendVerificationRequest } from "../auth.api";
import { FormField } from "./FormField";

interface Props {
  initialEmail?: string;
}

interface ErrorResponse {
  message?: string;
}

export function ResendVerificationForm({ initialEmail = "" }: Props) {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  async function handleResend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError("Enter your email address.");
      setMessage("");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await resendVerificationRequest(normalizedEmail);
      setMessage("Check your inbox for a new verification link.");
    } catch (err) {
      const axiosErr = err as AxiosError<ErrorResponse>;
      setError(
        axiosErr.response?.data?.message ??
          "We couldn't resend the verification email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleResend} noValidate className="space-y-3">
      <FormField
        id="resend-verification-email"
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        placeholder="you@example.com"
        disabled={loading}
      />

      {error && <p className="text-xs text-danger">{error}</p>}
      {message && <p className="text-xs text-accent">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm font-medium text-text-primary transition-colors duration-150 hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Sending…" : "Resend verification email"}
      </button>
    </form>
  );
}
