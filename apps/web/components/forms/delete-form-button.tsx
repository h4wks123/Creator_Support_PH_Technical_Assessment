"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import toaster from "@/components/toaster";
import { Button } from "@/components/button";
import { deleteForm } from "@/lib/api/forms";

export default function DeleteFormButton({ formId }: { formId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteForm(formId);
        router.refresh();
      } catch {
        toaster(500, "Unable to delete form");
      }
    });
  };

  return (
    <Button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      variant="ghost"
      size="ghost"
      interaction="ghost"
      className="px-3 py-2 text-delete hover:underline"
    >
      Delete
    </Button>
  );
}
