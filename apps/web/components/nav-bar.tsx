"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/button";
import {
  AUTH_CHANGE_EVENT,
  clearAuthToken,
  getLoggedInEmail,
} from "@/lib/auth";
import toaster from "@/components/toaster";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const email = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener(AUTH_CHANGE_EVENT, onStoreChange);
      return () => window.removeEventListener(AUTH_CHANGE_EVENT, onStoreChange);
    },
    getLoggedInEmail,
    () => "",
  );

  const handleLogout = () => {
    clearAuthToken();
    toaster(200, "Successfully logged out.");
    router.push("/login");
    router.refresh();
  };

  const showNavbar =
    pathname === "/" ||
    pathname.startsWith("/forms/") ||
    /^\/forms\/[^/]+\/responses(?:\/|$)/.test(pathname);

  if (!showNavbar) return null;

  return (
    <header className="flex justify-center border-b border-slate-200 bg-white">
      <nav className="flex flex-wrap justify-center w-full max-w-360 items-center gap-6 px-5 py-2 md:justify-between">
        <div className="flex gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image
              src="/creator_support_ph_logo_2.svg"
              alt="creator_support_ph_logo_2"
              width={50}
              height={50}
            />
            <h3 className="text-base font-bold text-secondary">
              Creator Support <span className="text-primary">PH</span>
            </h3>
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/" className="text-primary">
              Forms
            </Link>
            <Link href="#" className="text-slate-600 hover:text-primary">
              Webhook consumer
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-500">
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
