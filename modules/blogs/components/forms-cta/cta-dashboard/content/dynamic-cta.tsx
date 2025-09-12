"use client";
import { useContext } from "react";
import { CtaContext } from "../context/cta-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import parse from "html-react-parser";

export default function DynamicCta() {
  const { ctaState } = useContext(CtaContext);
  const { content, type } = ctaState;

  const ctaClasses = cn(
    "p-8 rounded-lg flex flex-col items-center gap-4 w-full max-w-[400px] mx-auto shadow-2xl text-white text-center",
    "bg-indigo-600", // Themed color
    {
      "shadow-2xl": type === "PopUp",
      "fixed bottom-5 right-5 z-20 max-w-[500px]": type === "Floating",
      "border dark:border-zinc-700 !max-w-full": type === "Sidebar",
    }
  );

  return (
    <div className={ctaClasses}>
      <h2 className="text-3xl font-bold">{content.heading}</h2>

      {/* description with HTML */}
      {content.description && (
        <div className="text-indigo-200 text-sm">
          {parse(content.description)}
        </div>
      )}

      <div className="flex items-center gap-4 mt-4">
        {content.primaryButton.text && (
          <Button variant="secondary" size="lg">
            {content.primaryButton.text}
          </Button>
        )}
        {content.secondaryButton.text && (
          <Button
            variant="outline"
            size="lg"
            className="bg-transparent border-white text-white hover:bg-white hover:text-indigo-600"
          >
            {content.secondaryButton.text}
          </Button>
        )}
      </div>

      {/* footnote with HTML */}
      {content.footnote && (
        <div className="text-xs text-indigo-300 mt-4">
          {parse(content.footnote)}
        </div>
      )}
    </div>
  );
}
