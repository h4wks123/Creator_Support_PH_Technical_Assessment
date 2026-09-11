import { notFound } from "next/navigation";
import PublicFormFields from "@/components/forms/public-form-fields";
import { getPublicForm, type PublicForm } from "@/lib/api/public-forms";

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const form: PublicForm = await getPublicForm(slug).catch(() => notFound());

  return (
    <main className="min-h-[calc(100dvh-57px)] bg-[#f7f8fa] py-10 text-secondary">
      <header className="mx-auto mb-4 max-w-3xl rounded-xl border-t-4 border-primary bg-white p-7 shadow-sm">
        <h1 className="font-[Poppins] text-3xl font-semibold">{form.title}</h1>
        {form.description ? (
          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-500">
            {form.description}
          </p>
        ) : null}
      </header>
      <PublicFormFields form={form} />
    </main>
  );
}
