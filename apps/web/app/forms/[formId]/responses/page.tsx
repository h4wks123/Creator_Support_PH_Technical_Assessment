import ResponsesList from "@/components/forms/responses-list";

export default async function ResponsesPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  return <ResponsesList formId={formId} />;
}
