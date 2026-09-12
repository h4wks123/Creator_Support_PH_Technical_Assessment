"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { getAuthToken } from "@/lib/auth";
import toaster from "@/components/toaster";

export default function ExportResponsesButton({ formId }: { formId: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const exportResponses = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_API_URL}/api/forms/${formId}/responses/export`,
        { headers: { Authorization: `Bearer ${getAuthToken()}` } },
      );
      if (!response.ok) throw new Error("Unable to export responses");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${formId}-responses.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toaster(
        500,
        error instanceof Error ? error.message : "Unable to export responses",
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      type="button"
      size="small"
      className="h-8 w-auto px-4 text-white"
      onClick={() => void exportResponses()}
      disabled={isExporting}
    >
      {isExporting ? "Exporting..." : "Export XLSX"}
    </Button>
  );
}
