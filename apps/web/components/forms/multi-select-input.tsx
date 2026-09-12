"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/button";
import { cn } from "@/utils/utils";

interface Props {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  "aria-label"?: string;
}

export default function MultiSelectInput({
  options,
  value,
  onChange,
  className,
  "aria-label": ariaLabel,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggleOption = (option: string) => {
    onChange(
      value.includes(option)
        ? value.filter((current) => current !== option)
        : [...value, option],
    );
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        size="ghost"
        interaction="ghost"
        className="min-h-11 w-full justify-between rounded-lg border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-normal text-secondary"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {value.length ? (
            value.map((option) => (
              <span
                key={option}
                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
              >
                {option}
                <span className="text-primary/70" aria-hidden="true">
                  ×
                </span>
              </span>
            ))
          ) : (
            <span className="text-slate-400">Select options</span>
          )}
        </span>
        <span className="ml-3 shrink-0 text-slate-400" aria-hidden="true">
          {isOpen ? "▴" : "▾"}
        </span>
      </Button>
      {isOpen ? (
        <div
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
          role="listbox"
          aria-label={ariaLabel}
          aria-multiselectable="true"
        >
          {options.length ? (
            options.map((option) => {
              const isSelected = value.includes(option);
              return (
                <Button
                  key={option}
                  type="button"
                  variant="ghost"
                  size="ghost"
                  interaction="ghost"
                  className="w-full justify-start rounded-md px-3 py-2 text-left text-sm font-normal text-secondary hover:bg-slate-50"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggleOption(option)}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border text-[10px]",
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-slate-300",
                    )}
                    aria-hidden="true"
                  >
                    {isSelected ? "✓" : null}
                  </span>
                  <span className="truncate">{option}</span>
                </Button>
              );
            })
          ) : (
            <p className="px-3 py-2 text-sm text-slate-400">
              No options configured
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
