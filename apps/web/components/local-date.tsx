"use client";

import { useSyncExternalStore } from "react";

const formatLocalDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function LocalDate({ value }: { value: string }) {
  const formattedDate = useSyncExternalStore(
    () => () => {},
    () => formatLocalDate(value),
    () => "...",
  );

  return <time dateTime={value}>{formattedDate}</time>;
}
