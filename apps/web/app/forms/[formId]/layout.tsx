import { Suspense } from "react";
import FormNavigation from "@/components/forms/form-navigation";

export default async function FormLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ formId: string }>;
}>) {
  const { formId } = await params;

  return (
    <>
      <FormNavigation formId={formId} />
      <Suspense
        fallback={
          <div className="bg-foreground flex min-h-[calc(100dvh-140px)] w-full items-center justify-center">
            <div
              className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary"
              role="status"
              aria-label="Loading form"
            />
          </div>
        }
      >
        {children}
      </Suspense>
    </>
  );
}
