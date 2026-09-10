"use client";

import { Button } from "@/components/button";
import { clearAuthToken, getLoggedInEmail } from "@/lib/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const router = useRouter();
  const email = getLoggedInEmail();

  const handleLogout = () => {
    clearAuthToken();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="bg-background flex justify-center">
      <nav className="w-full max-w-360 flex justify-between items-center gap-4 px-4 py-2">
        <div className="flex justify-center items-center gap-2">
          <Image
            src="/creator_support_ph_logo_2.svg"
            alt="creator_support_ph_logo_2"
            width={50}
            height={50}
          />
          <h3 className="text-xl font-bold text-secondary">
            Creator Support <span className="text-primary">PH</span>
          </h3>
        </div>
        <div className="flex items-center gap-4">
          {email ? (
            <p className="max-w-60 truncate text-sm font-semibold text-secondary">
              {email}
            </p>
          ) : null}
          <Button onClick={handleLogout} className="text-white">
            Logout
          </Button>
        </div>
      </nav>
    </header>
  );
}
