"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      //text and color
      variant: {
        default: "bg-primary",
        success: "bg-post",
        update: "bg-put",
        delete: "bg-delete",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        ghost: "",
      },
      roundness: {
        default: "rounded-4xl",
        ghost: "",
      },
      // size, margins, and paddings
      size: {
        default: "w-44 h-10 font-semibold tracking-wide rounded-4xl",
        icon: "w-10 h-10 tracking-wide rounded-full rounded-4xl",
        small: "w-28 h-10 tracking-wide rounded-4xl",
        full: "w-full h-12 tracking-wide",
        ghost: "",
      },
      text: {
        default: "text-md font-semibold",
        small: "text-sm font-semibold",
      },
      // hover and UX focus
      interaction: {
        default: "hover:bg-primary/95 ease-in-out",
        ghost: "",
      },
      position: {
        default: "",
        center: "mx-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      text: "default",
      position: "default",
      interaction: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, text, interaction, position, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({
            className,
            variant,
            size,
            text,
            interaction,
            position,
          }),
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
