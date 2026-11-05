"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-white text-black shadow hover:bg-white/90",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-600/90",
        outline:
          "border border-white/20 bg-transparent shadow-sm hover:bg-white/10 hover:text-white",
        secondary:
          "bg-zinc-800 text-white shadow-sm hover:bg-zinc-700",
        ghost: "hover:bg-white/10 hover:text-white",
        link: "text-primary underline-offset-4 hover:underline",
        inverse:
          "text-current hover:bg-white/10 active:bg-white/20 rounded-full",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "size-7 p-0 flex items-center justify-center",
      },
      mode: {
        default: "",
        icon: "p-0 flex items-center justify-center shrink-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      mode: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, mode, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, mode, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
