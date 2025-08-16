import * as React from "react"
import { cn } from "@/lib/utils"

const inputBaseClasses =
  "h-13 px-4 rounded-xl w-full border border-input hover:bg-secondary text-muted-foreground focus-visible:outline-none focus-visible:ring-[0.2px] focus-visible:ring-ring focus-visible:ring-offset-[0.2px]"
const placeholderClasses = "placeholder:text-muted-foreground"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputBaseClasses, placeholderClasses, className)}
      {...props}
    />
  )
}

export { Input }
