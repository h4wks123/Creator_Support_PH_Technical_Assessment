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
      {children}
    </>
  );
}
