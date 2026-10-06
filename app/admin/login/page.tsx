import type { Metadata } from "next";
import LoginForm from "./LoginForm";
import ThemeToggle from "@/components/admin/ThemeToggle";

export const metadata: Metadata = {
  title: "Admin Login | Rio Online School",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="admin-theme min-h-screen flex items-center justify-center bg-surface-container-low text-on-surface px-margin-mobile relative">
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="w-full max-w-96 bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant/30 p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-headline-md text-primary">Rio Online School</h1>
          <p className="font-body-md text-on-surface-variant">Admin sign in</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
