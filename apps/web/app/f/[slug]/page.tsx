import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPublicForm, type PublicForm } from "@/lib/api/public-forms";
import PublicFormFields from "@/components/forms/public-form-fields";

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const form: PublicForm = await getPublicForm(slug).catch(async () => {
    const isLoggedIn = Boolean((await cookies()).get("auth_token")?.value);
    redirect(isLoggedIn ? "/?error=form" : "/login?error=form");
  });

  return (
    <main className="min-h-dvh bg-page py-10 text-secondary">
      <header className="mx-auto mb-4 max-w-3xl rounded-xl border-t-4 border-primary bg-white p-7 shadow-sm">
        <h1 className="font-[Poppins] text-3xl font-semibold break-all">
          {form.title}
        </h1>
        {form.description ? (
          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-500 break-all">
            {form.description}
          </p>
        ) : null}
      </header>
      <PublicFormFields form={form} />
    </main>
  );
}
