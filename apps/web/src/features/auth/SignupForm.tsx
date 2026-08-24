import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { signupSchema, type SignupInput } from "./auth.schema";
import { signupRequest } from "./auth.api";
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Create account</h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>

            <input
              id="name"
              type="text"
              autoComplete="name"
              {...register("name")}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />

            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              {...register("email")}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              {...register("password")}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

          <button
            type="submit"
            disabled={isSubmittingSignup}
            className="w-full rounded-md bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isSubmittingSignup ? "Creating account…" : "Create account"}
          </button>
        </form>
        {/* //bottom element for login redirect */}
        <div className="mt-8 border-t border-border/60 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="group font-semibold text-foreground transition-colors hover:text-primary"
            >
              Log in
              <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
