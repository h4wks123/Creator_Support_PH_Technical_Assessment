import ResponseDetail from "@/components/forms/response-detail";

export default async function ResponseDetailPage({ params }: { params: Promise<{ slug: string; responseId: string }> }) {
  const { slug, responseId } = await params;
  return <ResponseDetail slug={slug} responseId={responseId} />;
}
