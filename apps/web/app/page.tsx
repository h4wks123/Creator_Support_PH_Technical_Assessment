"use client";

import { Button } from "@/components/button";
import { clearAuthToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleLogout = () => {
    clearAuthToken();
    router.push("/login");
    router.refresh();
  };

  return (
    <main className="min-h-dvh bg-background px-6 py-8 text-secondary">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Creator Support PH</p>
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <Button onClick={handleLogout} className="text-background">
          Logout
        </Button>
      </div>
    </main>
  );
}
