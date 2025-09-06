"use client";
import { useContext } from "react";
import { FormContext, FormField } from "../context/form-context";
import { cn } from "@/lib/utils";

const renderField = (field: FormField, isDark: boolean) => {
  return (
    <div key={field.id} className="w-full">
      <label className="block text-sm font-medium mb-1">{field.label}</label>
      <input
        type="text"
        placeholder={field.placeholder || ""}
        className={cn(
          "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500",
          isDark
            ? "bg-zinc-700 border-zinc-600 text-white"
            : "bg-white border-gray-300"
        )}
        readOnly
      />
    </div>
  );
};

export default function DynamicForm() {
  const { formState, theme } = useContext(FormContext);
  const { heading, description, fields, buttonText, footnote, formType } =
    formState;

  const isDark = theme === "dark";

  const formClasses = cn(
    "p-6 rounded-lg flex flex-col items-center gap-4 w-full max-w-[400px] mx-auto shadow-xl",
    {
      "bg-white text-gray-800": !isDark,
      "bg-zinc-800 text-gray-200": isDark,
      // PopUp and Gated no longer position themselves. They are now standard blocks centered by their parent.
      "shadow-2xl": formType === "PopUp" || formType === "Gated",
      // Floating remains fixed to the viewport, which is correct.
      "fixed bottom-5 right-5 z-20 max-w-[400px]": formType === "Floating",
      // Embedded forms use relative positioning and borders.
      "border dark:border-zinc-700":
        formType === "InLine" || formType === "EndOfPost",
      "border dark:border-zinc-700 !max-w-full": formType === "Sidebar",
    }
  );

  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  return (
    <div className={formClasses}>
      <div className="text-center">
        <h2 className="text-2xl font-bold">{heading}</h2>
        {description && (
          <p className="text-muted-foreground mt-2 whitespace-pre-wrap">
            {description}
          </p>
        )}
      </div>
      <div className="w-full space-y-4">
        {sortedFields.map((field) => renderField(field, isDark))}
      </div>
      <button
        className={cn(
          "w-full py-2 px-4 rounded-md font-semibold hover:opacity-90",
          isDark ? "bg-blue-500 text-white" : "bg-black text-white"
        )}
      >
        {buttonText}
      </button>
      {footnote && (
        <p className="text-xs text-center text-muted-foreground">{footnote}</p>
      )}
    </div>
  );
}
