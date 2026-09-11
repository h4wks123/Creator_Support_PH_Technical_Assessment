import FormBuilder from "@/components/forms/form-builder";

export default async function FormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  return <FormBuilder formId={formId} />;
}
