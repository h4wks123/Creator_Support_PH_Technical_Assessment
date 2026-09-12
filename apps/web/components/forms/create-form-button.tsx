"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/button";
import toaster from "@/components/toaster";
import { createForm } from "@/lib/api/forms";

export default function CreateFormButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    startTransition(async () => {
      try {
        const form = await createForm({
          title: "Untitled form",
          description: "",
          isPublished: false,
        });
        router.push(`/forms/${form.form_id}`);
      } catch {
        toaster(500, "Unable to create form");
      }
    });
  };

  return (
    <Button
      type="button"
      onClick={handleCreate}
      disabled={isPending}
      size="small"
      className="text-white"
    >
      New form
    </Button>
  );
}
