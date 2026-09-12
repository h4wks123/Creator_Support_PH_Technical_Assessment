import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import FormBuilder from "@/components/forms/form-builder";
import { createForm, getForm } from "@/lib/api/forms";
import { getQuestions } from "@/lib/api/questions";

export default async function FormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const authToken = (await cookies()).get("auth_token")?.value;

  if (formId === "new") {
    const form = await createForm(
      { title: "Untitled form", description: "", isPublished: false },
      authToken,
    ).catch(() => redirect("/?error=form"));
    redirect(`/forms/${form.form_id}`);
  }

  const [form, questions] = await Promise.all([
    getForm(formId, authToken),
    getQuestions(formId, authToken),
  ]).catch(() => redirect("/?error=form"));

  return (
    <main
      data-form-id={formId}
      className="min-h-[calc(100dvh-57px)] bg-page text-secondary"
    >
      <div className="mx-auto w-full max-w-360 px-5 py-8">
        <FormBuilder
          formId={formId}
          initialDraft={{
            formSlug: form.form_slug,
            title: form.form_title,
            description: form.form_description ?? "",
            published: form.form_is_published,
            questions,
          }}
        />
      </div>
    </main>
  );
}
