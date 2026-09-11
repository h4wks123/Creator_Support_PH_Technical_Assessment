"use client";

import { Button } from "@/components/button";
import toaster from "@/components/toaster";
import { registerUser } from "@/lib/api/auth";
import { saveAuthToken } from "@/lib/auth";
import { validateEmail, validatePassword } from "@/utils/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function Register() {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const errors: FieldErrors = {};

    if (!validateEmail(email)) {
      errors.email = "Enter a valid email address.";
    }

    if (!validatePassword(password)) {
      errors.password =
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
    }

    if (errors.email || errors.password) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await registerUser({
        email,
        password,
      });

      saveAuthToken(data.token);
      setIsSubmitting(false);
      router.push("/");
      router.refresh();
    } catch {
      toaster(500, "Unable to register. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-135 rounded-md flex flex-col items-center px-6 pb-12 shadow-xl/30 gap-6"
    >
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
          name="email"
          className="border border-secondary rounded-sm py-1 px-2 h-12"
          type="email"
          placeholder="creatorsupportph@gmail.com"
          required
        />
        {fieldErrors.email ? (
          <p className="text-sm text-delete">{fieldErrors.email}</p>
        ) : null}
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
        {fieldErrors.password ? (
          <p className="text-sm text-delete">{fieldErrors.password}</p>
        ) : null}
      </div>
      <Button type="submit" className="text-background" size={"full"}>
        {isSubmitting ? "Creating account..." : "Register"}
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
