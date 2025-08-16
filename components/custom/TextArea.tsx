import * as React from "react"
import { cn } from "@/lib/utils"

const textareaBaseClasses =
  "w-full min-h-[100px] custom-scrollbar resize-y px-4 pt-5 pb-3 rounded-xl bg-transparent border border-input focus-visible:outline-none focus-visible:ring-[0.2px] focus-visible:ring-ring focus-visible:ring-offset-[0.2px] text-md"

type TextareaProps = React.ComponentProps<"textarea"> & {
  label?: string
  helperText?: string
}

function Textarea({ className, label, helperText, value, ...props }: TextareaProps) {
  const hasValue = value && value.toString().length > 0

  return (
    <div className="relative w-full">
      <textarea
        value={value}
        className={cn(textareaBaseClasses, className)}
        {...props}
      />
      {label && (
       <label
  className={cn(
    "absolute left-4 transition-all pointer-events-none text-muted-foreground",
    hasValue
      ? "top-1 text-xs"
      : "top-4 text-base"
  )}
>
  {label}
</label>
      )}
      {helperText && !hasValue && (
        <p className="absolute left-4 top-10 text-xs text-muted-foreground pointer-events-none">
          {helperText}
        </p>
      )}
    </div>
  )
}

export { Textarea }
