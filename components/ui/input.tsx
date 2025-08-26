import * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.ComponentProps<"input"> & {
  suffix?: React.ReactNode;
};

function Input({ className, type, suffix, ...props }: InputProps) {
  return (
    <div
      className={cn(
        "flex w-full rounded-md border border-input focus-within:ring-[1px] focus-within:ring-ring/50 focus-within:border-ring bg-transparent shadow-xs"
      )}
    >
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 w-full min-w-0 border-none rounded-md bg-transparent px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          suffix ? "rounded-r-none" : "",
          className
        )}
        {...props}
      />
      {suffix && (
        <div className="flex h-9 items-center rounded-r-md border-l border-input bg-muted px-3 text-sm text-muted-foreground">
          {suffix}
        </div>
      )}
    </div>
  );
}

export { Input };
