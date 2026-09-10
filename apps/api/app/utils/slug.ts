export const createSlug = (title: string) => {
  const normalizedTitle = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const titlePart = normalizedTitle || "form";
  return `${titlePart}-${crypto.randomUUID().slice(0, 8)}`;
};
