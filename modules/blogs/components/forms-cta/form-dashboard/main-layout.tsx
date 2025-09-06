"use client";
import { useState, useContext, useEffect } from "react";
import EditorForm from "./editor-form";
import FormConfigure from "./sidebar/form-configure";
import FormFields from "./sidebar/form-fields";
import FormConfirmation from "./sidebar/form-confirmation";
import FormAction from "./sidebar/form-action";
import ContentPanel from "./content/content-panel";
import { FormProvider, FormContext } from "./context/form-context";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useSidebar } from "@/components/ui/sidebar";

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
  const { device, formState, setEmbedCodeEnabled } = useContext(FormContext);
  const { closeSidebar, openSidebar } = useSidebar();

  useEffect(() => {
    closeSidebar();
    return () => openSidebar();
  }, [closeSidebar, openSidebar]);

  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="w-[380px] bg-background border-r p-0 pl-1 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4">
          <SidebarContent activeTab={activeTab} />
        </div>
        <div className="mt-auto border-t px-5 py-3">
          <div className="flex items-center justify-between">
            <span className="text-normal">Custom Code &lt;/&gt;</span>
            <div className="flex align-center gap-2">
              <p className="text-small">Disabled</p>
              <Switch
                checked={formState.embedCode.isEnabled}
                onCheckedChange={setEmbedCodeEnabled}
              />
            </div>
          </div>
        </div>
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

// Main component that manages state
export default function MainLayout() {
  const [activeTab, setActiveTab] = useState("configure");

  return (
    <div className="flex flex-col h-full bg-muted/40">
      {/* The Provider now wraps everything and receives the state setter */}
      <FormProvider passedSetActiveTab={setActiveTab}>
        <EditorForm activeTab={activeTab} setActiveTab={setActiveTab} />
        <FormDashboard activeTab={activeTab} />
      </FormProvider>
    </div>
  );
}
