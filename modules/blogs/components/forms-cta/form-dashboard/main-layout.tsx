"use client";
import { useState, useContext, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import FormConfigure from "./sidebar/form-configure";
import FormFields from "./sidebar/form-fields";
import FormConfirmation from "./sidebar/form-confirmation";
import FormAction from "./sidebar/form-action";
import ContentPanel from "./content/content-panel";
import { FormProvider, FormContext } from "./context/form-context";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useSidebar } from "@/components/ui/sidebar";
import CustomCode from "./sidebar/custom-code";
import EditorHeader from "@/components/common/editor-header";

const SidebarContent = ({ activeTab }: { activeTab: string }) => {
  switch (activeTab) {
    case "configure":
      return <FormConfigure />;
    case "form":
      return <FormFields />;
    case "confirmation":
      return <FormConfirmation />;
    case "action":
      return <FormAction />;
    default:
      return <FormConfigure />;
  }
};

// Inner component with access to context
const FormDashboard = ({ activeTab }: { activeTab: string }) => {
  const { device, formState, setCustomCodeEnabled } = useContext(FormContext);
  const isCustomCodeActive = formState.customCode.isEnabled;
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
        {activeTab === "configure" && !isCustomCodeActive && (
          <div className="mt-auto border-t px-5 py-3">
            <div className="flex items-center justify-between">
              <span className="text-normal">Embed Form &lt;/&gt;</span>
              <div className="flex items-center gap-2">
                <p className="text-sm">
                  {formState.customCode.isEnabled ? "Enabled" : "Disabled"}
                </p>
                <Switch
                  checked={formState.customCode.isEnabled}
                  onCheckedChange={setCustomCodeEnabled}
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
          <div
            id="form-preview-container"
            className="h-full w-full overflow-y-auto"
          >
            <ContentPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

// NEW: A wrapper component that can access the context
const LayoutContent = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  // Now we can safely access the context here
  const {
    theme,
    setTheme,
    device,
    setDevice,
    saveChanges,
    cancelChanges,
    isSaving,
    saveMessage,
    saveError,
    formTabs,
    onBack,
    formState,
  } = useContext(FormContext);
  const isCustomCodeActive = formState.customCode.isEnabled;

  return (
    <>
      {/* The disabled prop is now passed correctly from a component that has access to the context state */}
      <EditorHeader
        title="Form"
        tabs={formTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={theme}
        onThemeChange={() => setTheme(theme === "light" ? "dark" : "light")}
        device={device}
        onDeviceChange={setDevice}
        onSaveChanges={saveChanges}
        onCancelChanges={cancelChanges}
        onBack={onBack}
        isSaving={isSaving}
        saveMessage={saveMessage}
        saveError={saveError}
        isDisabled={isCustomCodeActive}
      />
      <FormDashboard activeTab={activeTab} />
    </>
  );
};

// Main component that manages state
export default function MainLayout({ pageId }: { pageId: string }) {
  const [activeTab, setActiveTab] = useState("configure");
  const searchParams = useSearchParams();
  const formId = searchParams.get("formId");

  return (
    <div className="flex flex-col h-full bg-muted/40">
      <FormProvider
        passedSetActiveTab={setActiveTab}
        pageId={pageId}
        formId={formId}
      >
        <LayoutContent activeTab={activeTab} setActiveTab={setActiveTab} />
      </FormProvider>
    </div>
  );
}
