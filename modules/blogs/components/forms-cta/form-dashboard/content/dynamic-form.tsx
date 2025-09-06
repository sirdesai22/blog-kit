"use client";
import { useContext, ChangeEvent } from "react";
import { FormContext, FormField } from "../context/form-context";
import { cn } from "@/lib/utils";

// --- Fully Interactive renderField function ---
const renderField = (
  field: FormField,
  isDark: boolean,
  value: any,
  onChange: (fieldId: string, value: any) => void
) => {
  const commonClasses = cn(
    "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500",
    isDark
      ? "bg-zinc-700 border-zinc-600 text-white"
      : "bg-white border-gray-300"
  );

  const handleMultiSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    onChange(field.id, selectedOptions);
  };

  const fieldContent = () => {
    switch (field.type) {
      case "Email":
        return (
          <input
            type="email"
            placeholder={field.placeholder}
            className={commonClasses}
            value={value || ""}
            onChange={(e) => onChange(field.id, e.target.value)}
          />
        );
      case "Phone":
        return (
          <input
            type="tel"
            placeholder={field.placeholder}
            className={commonClasses}
            value={value || ""}
            onChange={(e) => onChange(field.id, e.target.value)}
          />
        );
      case "LongText":
        return (
          <textarea
            placeholder={field.placeholder}
            className={commonClasses}
            rows={4}
            value={value || ""}
            onChange={(e) => onChange(field.id, e.target.value)}
          />
        );
      case "Select":
      case "Country":
        const options =
          field.type === "Country"
            ? ["United States", "Canada", "Mexico", "United Kingdom"]
            : field.options || [];
        return (
          <select
            className={commonClasses}
            value={value || ""}
            onChange={(e) => onChange(field.id, e.target.value)}
          >
            {field.placeholder && (
              <option value="" disabled>
                {field.placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      case "MultiSelect":
        return (
          <select
            className={commonClasses}
            multiple={true}
            value={value || []}
            onChange={handleMultiSelectChange}
          >
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      case "ShortText":
      default:
        return (
          <input
            type="text"
            placeholder={field.placeholder}
            className={commonClasses}
            value={value || ""}
            onChange={(e) => onChange(field.id, e.target.value)}
          />
        );
    }
  };

  return (
    <div key={field.id} className="w-full text-left">
      <label className="block text-sm font-medium mb-1">{field.label}</label>
      {fieldContent()}
    </div>
  );
};

export default function DynamicForm() {
  const { formState, theme, updateFieldValue, setIsConfirmationVisible } =
    useContext(FormContext);
  const {
    heading,
    description,
    fields,
    buttonText,
    footnote,
    formType,
    formValues,
  } = formState;
  const isDark = theme === "dark";

  const formClasses = cn(
    "p-6 rounded-lg flex flex-col items-center gap-4 w-full max-w-[400px] mx-auto shadow-xl",
    {
      "bg-white text-gray-800": !isDark,
      "bg-zinc-800 text-gray-200": isDark,
      "shadow-2xl": formType === "PopUp" || formType === "Gated",
      "fixed bottom-5 right-5 z-20 max-w-[400px]": formType === "Floating",
      "border dark:border-zinc-700":
        formType === "InLine" || formType === "EndOfPost",
      "border dark:border-zinc-700 !max-w-full": formType === "Sidebar",
    }
  );

  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent default form submission
    console.log("Form Submitted with values:", formValues);
    setIsConfirmationVisible(true);
  };

  return (
    <form className={formClasses}>
      <div className="text-center">
        <h2 className="text-2xl font-bold">{heading}</h2>
        {description && (
          <p className="text-muted-foreground mt-2 whitespace-pre-wrap">
            {description}
          </p>
        )}
      </div>
      <div className="w-full space-y-4">
        {sortedFields.map((field) =>
          renderField(field, isDark, formValues[field.id], updateFieldValue)
        )}
      </div>
      <button
        type="submit"
        onClick={handleSubmit}
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
    </form>
  );
}
