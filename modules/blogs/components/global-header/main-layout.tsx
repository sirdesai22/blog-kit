"use client";
import { useState, useContext } from "react";
import EditorHeader from "./editor-header";
import HeaderItems from "./sidebar/header-items";
import HeaderStyle from "./sidebar/header-style";
import ContentPanel from "./content/content-panel";
import { HeaderContext } from "./context/header-context";
import { cn } from "@/lib/utils";

export default function MainLayout() {
  const [activeTab, setActiveTab] = useState("items");
  const { device } = useContext(HeaderContext);

  return (
    <div className="flex flex-col h-full bg-muted/40">
      <EditorHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[380px] bg-background border-r p-4 overflow-y-auto shrink-0">
          {activeTab === "items" ? <HeaderItems /> : <HeaderStyle />}
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
