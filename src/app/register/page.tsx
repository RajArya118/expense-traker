"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Wallet,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { registerAction, AuthActionResponse } from "@/actions/auth";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState<AuthActionResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  // Controlled form values
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await registerAction(state, formData);
      if (result) {
        setState(result);
      }
    });
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-emerald-600/15 blur-[128px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-3 group transition-transform hover:scale-105"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 shadow-xl shadow-indigo-500/30">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Expense<span className="text-indigo-400">Flow</span>
              </span>
              <span className="ml-2 rounded-md bg-emerald-500/20 border border-emerald-400/30 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                REGISTER
              </span>
            </div>
          </Link>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-white">
            Create Your Account
          </h1>
          <p className="mt-1.5 text-xs text-slate-400">
            Start tracking expenses with isolated multi-tenant privacy
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* General Error Banner */}
          {state?.error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Full Name
              </label>
              <Input
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<User className="h-4 w-4 text-slate-400" />}
                className="bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500"
              />
              {state?.fieldErrors?.name && (
                <p className="mt-1 text-[11px] text-rose-400 font-medium">
                  {state.fieldErrors.name}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Email Address
              </label>
              <Input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="alex@expenseflow.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="h-4 w-4 text-slate-400" />}
                className="bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500"
              />
              {state?.fieldErrors?.email && (
                <p className="mt-1 text-[11px] text-rose-400 font-medium">
                  {state.fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Password
              </label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4 text-slate-400" />}
                  className="bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {state?.fieldErrors?.password ? (
                <p className="mt-1 text-[11px] text-rose-400 font-medium">
                  {state.fieldErrors.password}
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-slate-500">
                  Must be at least 8 characters and include both letters & numbers.
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Confirm Password
              </label>
              <Input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock className="h-4 w-4 text-slate-400" />}
                className="bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500"
              />
              {state?.fieldErrors?.confirmPassword && (
                <p className="mt-1 text-[11px] text-rose-400 font-medium">
                  {state.fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={isPending}
              className="w-full mt-3 rounded-xl font-bold py-2.5 shadow-lg shadow-indigo-600/30 text-sm"
            >
              <span>Create Account</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Security badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-slate-500">
          <span>🔒 Password Salted & Hashed</span>
          <span>•</span>
          <span>Zero Plaintext Storage</span>
        </div>
      </div>
    </div>
  );
}
