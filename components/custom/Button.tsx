import * as React from "react"
import { cn } from "@/lib/utils"

const primaryButtonBaseClasses =
  "w-full h-13 rounded-xl font-medium text-base"
const socialButtonClasses =
  "w-full h-13 flex items-center hover:cursor-pointer justify-center px-4 rounded-xl border border-input text-muted-foreground hover:bg-secondary"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "social"
}

function Button({ className, variant = "primary", disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        variant === "primary"
          ? disabled
            ? "bg-muted-dark text-secondary cursor-not-allowed"
            : "bg-primary text-secondary hover:bg-primary/90 hover:cursor-pointer"
          : socialButtonClasses,
        primaryButtonBaseClasses,
        className
      )}
      {...props}
    />
  )
}

export { Button }
