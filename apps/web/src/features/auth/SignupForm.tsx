import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { signupSchema, type SignupInput } from "./auth.schema";
import { signupRequest } from "./auth.api";
import { AuthLayout } from "./components/AuthLayout";
import { FormField } from "./components/FormField";
import type { AxiosError } from "axios";

export function SignupForm() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmittingSignup, setIsSubmittingSignup] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data: SignupInput) => {
    setServerError(null);
    setIsSubmittingSignup(true);
    try {
      await signupRequest(data);
      navigate("/login", {
        replace: true,
        state: { message: "Account created — please log in." },
      });
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setServerError(
        axiosErr.response?.data?.message ?? "Signup failed. Try again.",
      );
    } finally {
      setIsSubmittingSignup(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      footer={
        <p>
          Already have an account?{" "}
          <Link to="/login" className="group font-medium text-accent hover:underline">
            Log in
            <span className="ml-0.5 inline-block transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField id="name" label="Name" type="text" autoComplete="name" error={errors.name?.message} {...register("name")} />
        <FormField id="email" label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <FormField id="password" label="Password" type="password" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
        <FormField id="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />

        {serverError && <p className="text-sm text-danger">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmittingSignup}
          className="w-full rounded-md bg-accent py-2 text-sm font-medium text-bg transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
        >
          {isSubmittingSignup ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}