"use client";

import { Button } from "@/components/button";
import toaster from "@/components/toaster";
import { loginUser } from "@/lib/api/auth";
import { saveAuthToken } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";

export default function Login() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const data = await loginUser({
        email: String(formData.get("email")),
        password: String(formData.get("password")),
      });

      toaster(200, "Successfully signed in");

      saveAuthToken(data.token);
      setIsSubmitting(false);
      router.push("/");
      router.refresh();
    } catch {
      toaster(500, "Unable to sign in. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-135 rounded-md flex flex-col items-center px-6 py-12 shadow-xl/30 gap-6"
    >
      <Image
        src="/creator_support_ph_logo.png"
        alt="creator_support_ph_logo"
        width={150}
        height={50}
        loading="eager"
        style={{ width: "auto", height: "auto" }}
      />
      <h2 className="text-5xl font-bold text-secondary">Sign In</h2>
      <div className="w-full flex flex-col gap-2">
        <h6 className="font-semibold text-xl">Email</h6>
        <input
          name="email"
          className="border border-secondary rounded-sm py-1 px-2 h-12"
          type="email"
          placeholder="creatorsupportph@gmail.com"
          required
        />
      </div>
      <div className="w-full flex flex-col gap-2">
        <h6 className="font-semibold text-xl">Password</h6>
        <input
          name="password"
          className="border border-secondary rounded-sm py-1 px-2 h-12"
          type="password"
          placeholder="**********"
          required
        />
      </div>
      <Button type="submit" className="text-background" size={"full"}>
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>
      <Link
        href="/register"
        className="w-full text-start text-primary underline text-md"
      >
        Register instead
      </Link>
    </form>
  );
}
