"use client";

import { Button } from "@/components/button";
import {
  AUTH_CHANGE_EVENT,
  clearAuthToken,
  getLoggedInEmail,
} from "@/lib/auth";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import toaster from "./toaster";

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
    pathname.startsWith("/form/") ||
    /^\/f\/[^/]+\/responses(?:\/|$)/.test(pathname);

  if (!showNavbar) return null;

  return (
    <header className="flex justify-center border-b border-slate-200 bg-white">
      <nav className="flex w-full max-w-360 items-center gap-6 px-5 py-2">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/creator_support_ph_logo_2.svg"
            alt="creator_support_ph_logo_2"
            width={26}
            height={26}
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
        <div className="ml-auto flex items-center gap-4 text-sm text-slate-500">
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
