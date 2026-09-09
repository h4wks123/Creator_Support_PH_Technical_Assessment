"use client";

import { Button } from "@/components/button";
import Image from "next/image";
import Link from "next/link";

export default function Register() {
  return (
    <form className="bg-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-135 rounded-md flex flex-col items-center px-6 pb-12 shadow-xl/30 gap-6">
      <Image
        src="/creator_support_ph_logo.png"
        alt="creator_support_ph_logo"
        width={200}
        height={100}
        loading="eager"
        style={{ width: "auto", height: "auto" }}
      />
      <h2 className="text-5xl font-bold text-secondary">Register</h2>
      <div className="w-full flex flex-col gap-2">
        <h6 className="font-semibold text-xl">Email</h6>
        <input
          className="border border-secondary rounded-sm py-1 px-2 h-12"
          type="email"
          placeholder="creatorsupportph@gmail.com"
        />
      </div>
      <div className="w-full flex flex-col gap-2">
        <h6 className="font-semibold text-xl">Password</h6>
        <input
          className="border border-secondary rounded-sm py-1 px-2 h-12"
          type="password"
          placeholder="**********"
        />
      </div>
      <Button type="submit" className="text-background" size={"full"}>
        Sign In
      </Button>
      <Link
        href="/login"
        className="w-full text-start text-primary underline text-md"
      >
        Sign in instead
      </Link>
    </form>
  );
}
