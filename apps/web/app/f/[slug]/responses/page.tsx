import ResponsesList from "@/components/forms/responses-list";

export default async function ResponsesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ResponsesList slug={slug} />;
}
