"use client";
import { useContext, useState, useEffect } from "react";
import { FormContext } from "../context/form-context";
import DynamicForm from "./dynamic-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// --- NEW: Confirmation Message Component ---
const ConfirmationMessage = () => {
  const { formState, theme, setIsConfirmationVisible } =
    useContext(FormContext);
  const { confirmation } = formState;
  const isDark = theme === "dark";

  const handleButtonClick = () => {
    if (confirmation.buttonType === "Link" && confirmation.url) {
      window.open(
        confirmation.url,
        confirmation.openInNewTab ? "_blank" : "_self"
      );
    }
    setIsConfirmationVisible(false); // Close the message
  };

  const confirmationClasses = cn(
    "p-4 rounded-lg flex flex-col items-center justify-center gap-2 w-full max-w-[400px] mx-auto shadow-xl text-center",
    isDark ? "bg-zinc-800 text-gray-200" : "bg-white text-gray-800"
  );

  return (
    <div className={confirmationClasses}>
      <h2 className="text-header">{confirmation.heading}</h2>
      <p className="text-normal">{confirmation.description}</p>
      <Button onClick={handleButtonClick} className="mt-4">
        {confirmation.buttonText}
      </Button>
    </div>
  );
};

// --- Skeleton Components (Unchanged) ---
const SkeletonBlock = ({ className }: { className?: string }) => {
  const { theme } = useContext(FormContext);
  const bg = theme === "dark" ? "bg-zinc-700" : "bg-gray-300";
  return <div className={cn("rounded", bg, className)} />;
};
const ArticleSkeleton = ({ showInlineForm }: { showInlineForm: boolean }) => (
  <div className="bg-background dark:bg-zinc-800/50 shadow-lg rounded-xl p-6 md:p-8 space-y-10">
    {/* Title + subtitle */}
    <div>
      <SkeletonBlock className="h-8 w-2/3 mb-3" />
      <SkeletonBlock className="h-4 w-1/3" />
    </div>

    {/* Profile row */}
    <div className="flex items-center gap-4">
      <SkeletonBlock className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-4 w-1/4" />
        <SkeletonBlock className="h-3 w-1/3" />
      </div>
    </div>

    {/* Paragraph lines */}
    <div className="space-y-3">
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-11/12" />
      <SkeletonBlock className="h-4 w-10/12" />
    </div>

    {/* Image placeholder */}
    <SkeletonBlock className="h-64 w-full rounded-lg" />
    <div className="space-y-3">
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-11/12" />
      <SkeletonBlock className="h-4 w-10/12" />
    </div>

    {/* Grid cards */}
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-3">
          <SkeletonBlock className="h-28 w-full rounded-md" />
          <SkeletonBlock className="h-4 w-3/4" />
          <SkeletonBlock className="h-3 w-1/2" />
        </div>
      ))}
    </div>
    <SkeletonBlock className="h-64 w-full rounded-lg" />
    {showInlineForm && (
      <div className="pt-10">
        <DynamicForm />
      </div>
    )}

    {/* Another text block */}
    <div className="space-y-3">
      <SkeletonBlock className="h-4 w-10/12" />
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-9/12" />
      <SkeletonBlock className="h-4 w-11/12" />
    </div>

    {/* CTA button */}
    <SkeletonBlock className="h-12 w-40 rounded-md" />

    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-3">
          <SkeletonBlock className="h-28 w-full rounded-md" />
          <SkeletonBlock className="h-4 w-3/4" />
          <SkeletonBlock className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

// --- Main Content Panel Component (Updated) ---
export default function ContentPanel() {
  const {
    formState,
    theme,
    device,
    isConfirmationVisible,
    setIsConfirmationVisible,
  } = useContext(FormContext);
  const { formType, formTrigger, timeDelay, scrollTrigger } = formState;
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [hasBeenTriggered, setHasBeenTriggered] = useState(false);

  useEffect(() => {
    setIsFormVisible(false);
    setHasBeenTriggered(false);
    setIsConfirmationVisible(false); // Also reset confirmation on change
    if (!["PopUp", "Floating", "Gated"].includes(formType)) {
      setIsFormVisible(true);
    }
  }, [
    formType,
    formTrigger,
    timeDelay,
    scrollTrigger,
    setIsConfirmationVisible,
  ]);

  // Triggers (Time, Scroll, Exit Intent) are unchanged
  useEffect(() => {
    if (
      !["PopUp", "Floating", "Gated"].includes(formType) ||
      formTrigger !== "TimeDelay" ||
      hasBeenTriggered
    )
      return;
    const timer = setTimeout(() => {
      setIsFormVisible(true);
      setHasBeenTriggered(true);
    }, timeDelay * 1000);
    return () => clearTimeout(timer);
  }, [timeDelay, formTrigger, formType, hasBeenTriggered]);
  useEffect(() => {
    if (
      !["PopUp", "Floating", "Gated"].includes(formType) ||
      formTrigger !== "Scroll" ||
      hasBeenTriggered
    )
      return;
    const container = document.getElementById("form-preview-container");
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;
      if (scrollPercent >= scrollTrigger && !hasBeenTriggered) {
        setIsFormVisible(true);
        setHasBeenTriggered(true);
      }
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [scrollTrigger, formTrigger, formType, hasBeenTriggered]);
  useEffect(() => {
    if (
      formType !== "PopUp" ||
      formTrigger !== "ExitIntent" ||
      hasBeenTriggered
    )
      return;
    const handleMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasBeenTriggered) {
        setIsFormVisible(true);
        setHasBeenTriggered(true);
      }
    };
    document.addEventListener("mouseout", handleMouseOut);
    return () => document.removeEventListener("mouseout", handleMouseOut);
  }, [formTrigger, formType, hasBeenTriggered]);

  const bg = theme === "dark" ? "bg-zinc-900" : "bg-gray-100";
  const isOverlayFormVisible =
    (formType === "PopUp" || formType === "Gated") && isFormVisible;

  return (
    <div className={`relative min-h-full ${bg}`}>
      <div className="flex justify-center">
        <div className="w-full max-w-none xl:max-w-[1400px] flex">
          <div className="flex-1 min-w-0">
            <ArticleSkeleton
              showInlineForm={formType === "InLine" && isFormVisible}
            />
            {formType === "EndOfPost" && isFormVisible && (
              <div className="pt-8 mt-8 border-t dark:border-zinc-700">
                <DynamicForm />
              </div>
            )}
            {formType === "Sidebar" && device === "mobile" && isFormVisible && (
              <div className="p-4 mt-8 border-t dark:border-zinc-700">
                {" "}
                <h3 className="text-lg font-bold mb-4 text-center">
                  Subscribe Here
                </h3>
                <DynamicForm />
              </div>
            )}
          </div>
          {formType === "Sidebar" && device !== "mobile" && isFormVisible && (
            <aside className="w-80 flex-shrink-0 p-4 hidden lg:block">
              <div className="sticky top-4">
                <DynamicForm />
              </div>
            </aside>
          )}
        </div>
      </div>

      {isOverlayFormVisible && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
          {formType === "Gated" && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          )}
          <div className="relative z-30">
            {isConfirmationVisible ? <ConfirmationMessage /> : <DynamicForm />}
          </div>
        </div>
      )}

      {formType === "Floating" && isFormVisible && (
        <div className="fixed bottom-5 right-5 z-20 max-w-[400px]">
          {isConfirmationVisible ? <ConfirmationMessage /> : <DynamicForm />}
        </div>
      )}
    </div>
  );
}
