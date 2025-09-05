"use client";
import { useState, useContext, useEffect } from "react";
import EditorHeader from "./editor-header";
import HeaderItems from "./sidebar/header-items";
import HeaderStyle from "./sidebar/header-style";
import CustomCode from "./sidebar/custom-code"; // Import new component
import ContentPanel from "./content/content-panel";
import { HeaderContext } from "./context/header-context";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useSidebar } from "@/components/ui/sidebar";

export default function MainLayout() {
  const [activeTab, setActiveTab] = useState("items");
  const { device } = useContext(HeaderContext);
  const [showCustomCodeView, setShowCustomCodeView] = useState(false); // New state to toggle view
  const { closeSidebar, openSidebar } = useSidebar();

  useEffect(() => {
    closeSidebar();
    return () => {
      openSidebar();
    };
  }, [closeSidebar, openSidebar]);

  return (
    <div className="flex flex-col h-full bg-muted/40">
      <EditorHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        disabled={showCustomCodeView} // Disable tabs when in custom code view
      />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[380px] bg-background border-r p-0 pl-1 flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            {showCustomCodeView ? (
              <CustomCode onBack={() => setShowCustomCodeView(false)} />
            ) : activeTab === "items" ? (
              <HeaderItems />
            ) : (
              <HeaderStyle />
            )}
          </div>

          {!showCustomCodeView && (
            <div className="mt-auto border-t px-5 py-3">
              <div className="flex items-center justify-between">
                <span className="text-normal">Custom Code &lt;/&gt;</span>
                <div className="flex align-center gap-2">
                  <p className="text-small">Disabled</p>
                  <Switch
                    checked={showCustomCodeView}
                    onCheckedChange={setShowCustomCodeView}
                  />
                </div>
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 bg-gray-100 dark:bg-zinc-900 overflow-y-auto flex justify-center p-2">
          <div
            className={cn(
              "relative h-full overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5 transition-all duration-500 ease-in-out",
              device === "mobile" ? "w-full max-w-[420px]" : "w-full max-w-none"
            )}
          >
            <div className="h-full w-full overflow-y-auto">
              <ContentPanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
