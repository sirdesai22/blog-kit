"use client";
import { useState, useContext, useEffect } from "react";
import CtaConfigure from "./sidebar/cta-configure";
import CtaEditor from "./sidebar/cta-editor";
import CustomCode from "./sidebar/custom-code";
import ContentPanel from "./content/content-panel";
import { CtaProvider, CtaContext } from "./context/cta-context";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useSidebar } from "@/components/ui/sidebar";
import { useSearchParams } from "next/navigation";
import EditorHeader from "@/components/common/editor-header";

const SidebarContent = ({ activeTab }: { activeTab: string }) => {
  switch (activeTab) {
    case "configure":
      return <CtaConfigure />;
    case "cta":
      return <CtaEditor />;
    default:
      return <CtaConfigure />;
  }
};

const CtaDashboard = ({ activeTab }: { activeTab: string }) => {
  const {
    ctaState,
    setCustomCodeEnabled,
    theme,
    setTheme,
    device,
    setDevice,
    saveChanges,
    cancelChanges,
  } = useContext(CtaContext);
  const isCustomCodeActive = ctaState.customCode.isEnabled;
  const { closeSidebar, openSidebar } = useSidebar();

  useEffect(() => {
    closeSidebar();
    return () => openSidebar();
  }, [closeSidebar, openSidebar]);

  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="w-[380px] bg-background border-r p-0 pl-1 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4">
          {isCustomCodeActive ? (
            <CustomCode onBack={() => setCustomCodeEnabled(false)} />
          ) : (
            <SidebarContent activeTab={activeTab} />
          )}
        </div>
        <div className="mt-auto border-t px-5 py-3">
          <div className="flex items-center justify-between">
            <span className="text-normal">Custom Code &lt;/&gt;</span>
            <div className="flex items-center gap-2">
              <p className="text-sm">
                {isCustomCodeActive ? "Enabled" : "Disabled"}
              </p>
              <Switch
                checked={isCustomCodeActive}
                onCheckedChange={setCustomCodeEnabled}
              />
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 bg-gray-100 dark:bg-zinc-900 overflow-y-auto flex justify-center p-2">
        <div
          className={cn(
            "relative h-full overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5",
            device === "mobile" ? "w-full max-w-[420px]" : "w-full max-w-none"
          )}
        >
          <div
            id="cta-preview-container"
            className="h-full w-full overflow-y-auto"
          >
            <ContentPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

const LayoutContent = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  const {
    ctaTabs,
    setCustomCodeEnabled,
    onBack,
    theme,
    setTheme,
    device,
    setDevice,
    saveChanges,
    cancelChanges,
  } = useContext(CtaContext);
  return (
    <>
      <EditorHeader
        title="CTA"
        tabs={ctaTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={theme}
        onThemeChange={() => setTheme(theme === "light" ? "dark" : "light")}
        device={device}
        onDeviceChange={setDevice}
        onSaveChanges={saveChanges}
        onCancelChanges={cancelChanges}
        onBack={onBack}
      />
      <CtaDashboard activeTab={activeTab} />
    </>
  );
};

export default function MainLayout({ pageId }: { pageId: string }) {
  const [activeTab, setActiveTab] = useState("configure");
  const searchParams = useSearchParams();
  const ctaId = searchParams.get("ctaId");
  return (
    <div className="flex flex-col h-full bg-muted/40">
      <CtaProvider
        pageId={pageId}
        ctaId={ctaId}
        passedSetActiveTab={setActiveTab}
      >
        <LayoutContent activeTab={activeTab} setActiveTab={setActiveTab} />
      </CtaProvider>
    </div>
  );
}
