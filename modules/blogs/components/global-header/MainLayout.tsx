"use client";
import { useState } from "react";
import EditorHeader from "./EditorHeader";
import HeaderItems from "./sidebar/HeaderItems";
import HeaderStyle from "./sidebar/HeaderStyle";
import ContentPanel from "./content/ContentPanel";

export default function MainLayout() {
  const [activeTab, setActiveTab] = useState("items");

  return (
    <div className="flex flex-col h-full bg-muted/40">
      <EditorHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[380px] bg-background border-r p-4 overflow-y-auto">
          {activeTab === "items" ? <HeaderItems /> : <HeaderStyle />}
        </aside>
        <main className="flex-1 bg-gray-100 dark:bg-zinc-900 overflow-y-auto">
          <ContentPanel />
        </main>
      </div>
    </div>
  );
}
