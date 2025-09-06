"use client";
import { useContext, useState, useEffect } from "react";
import { FormContext } from "../context/form-context";
import DynamicForm from "./dynamic-form";
import { cn } from "@/lib/utils";

// --- Skeleton Components (Unchanged from your version) ---
const SkeletonBlock = ({ className }: { className?: string }) => {
  const { theme } = useContext(FormContext);
  const bg = theme === "dark" ? "bg-zinc-700" : "bg-gray-300";
  return <div className={cn("rounded", bg, className)} />;
};

const ArticleSkeleton = ({ showInlineForm }: { showInlineForm: boolean }) => (
  <div className="">
    <div className="bg-background dark:bg-zinc-800/50 shadow-lg rounded-xl p-6 md:p-8">
      <SkeletonBlock className="h-10 w-3/4 mb-4" />
      <SkeletonBlock className="h-4 w-1/2 mb-6" />
      <div className="flex items-center gap-3 mb-8">
        <SkeletonBlock className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-1/4" />
          <SkeletonBlock className="h-3 w-1/3" />
        </div>
      </div>
      <div className="space-y-3 text-lg">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-5/6" />
      </div>
      <SkeletonBlock className="h-48 w-full my-8" />
      <div className="space-y-3 text-lg">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-3/4" />
        <div className="grid grid-cols-2 gap-4">
          <SkeletonBlock className="h-34" />
          <SkeletonBlock className="h-34" />
          <SkeletonBlock className="h-34" />
          <SkeletonBlock className="h-34" />
          <SkeletonBlock className="h-34" />
          <SkeletonBlock className="h-34" />
        </div>
      </div>
      {showInlineForm && (
        <div className="py-10">
          <DynamicForm />
        </div>
      )}
      <div className="space-y-3 text-lg mt-8">
        <SkeletonBlock className="h-6 w-1/3 mb-4" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-2/3" />
      </div>
      <SkeletonBlock className="h-64 w-full my-8" />
      <div className="space-y-3 text-lg mt-8">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-5/6" />
      </div>
    </div>
  </div>
);

// --- Main Content Panel Component (Revised Logic) ---
export default function ContentPanel() {
  const { formState, theme, device } = useContext(FormContext);
  const { formType, formTrigger, timeDelay, scrollTrigger } = formState;
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [hasBeenTriggered, setHasBeenTriggered] = useState(false);

  useEffect(() => {
    setIsFormVisible(false);
    setHasBeenTriggered(false);
    if (!["PopUp", "Floating", "Gated"].includes(formType)) {
      setIsFormVisible(true);
    }
  }, [formType, formTrigger, timeDelay, scrollTrigger]);
  useEffect(() => {
    if (
      !["PopUp", "Floating", "Gated"].includes(formType) || // BUG FIX: Added "Gated"
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

            {/* --- BUG FIX: Mobile Sidebar UI --- */}
            {/* Renders the form as a prominent block at the end of content on mobile */}
            {formType === "Sidebar" && device === "mobile" && isFormVisible && (
              <div className="p-4 mt-8 border-t dark:border-zinc-700">
                <h3 className="text-lg font-bold mb-4 text-center">
                  Subscribe Here
                </h3>
                <DynamicForm />
              </div>
            )}
          </div>
          {/* --- BUG FIX --- Desktop sidebar remains unchanged */}
          {formType === "Sidebar" && device !== "mobile" && isFormVisible && (
            <aside className="w-80 flex-shrink-0 p-4 hidden lg:block">
              <div className="sticky top-4">
                <DynamicForm />
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* --- BUG FIX: Centered Overlay Container --- */}
      {/* This container is absolute to the parent, confining the overlay and centering the form perfectly */}
      {isOverlayFormVisible && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
          {formType === "Gated" && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          )}
          <div className="relative z-30">
            <DynamicForm />
          </div>
        </div>
      )}

      {/* Floating form remains as-is, as its behavior was correct */}
      {formType === "Floating" && isFormVisible && <DynamicForm />}
      <div />
    </div>
  );
}
