export default function Loading() {
  return (
    <div className="bg-foreground flex min-h-[calc(100dvh-57px)] w-full items-center justify-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary"
        role="status"
        aria-label="Loading forms"
      />
    </div>
  );
}
