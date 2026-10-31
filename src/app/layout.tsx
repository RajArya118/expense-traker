import type { Metadata } from "next";
import "./globals.css";
import { ExpenseProvider } from "@/context/ExpenseContext";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "ExpenseFlow — Modern Finance & Expense Management",
  description:
    "An enterprise-grade, modern expense tracking dashboard built with Next.js, Tailwind CSS, TypeScript, and PostgreSQL.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50/60 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
        <ExpenseProvider>
          <AppShell>{children}</AppShell>
        </ExpenseProvider>
      </body>
    </html>
  );
}
