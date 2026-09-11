import ResponseDetail from "@/components/forms/response-detail";

export default async function ResponseDetailPage({
  params,
}: {
  params: Promise<{ formId: string; responseId: string }>;
}) {
  const { formId, responseId } = await params;
  return <ResponseDetail formId={formId} responseId={responseId} />;
}
