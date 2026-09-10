import FormBuilder from "@/components/forms/form-builder";

export default async function EditFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FormBuilder formId={id} />;
}
