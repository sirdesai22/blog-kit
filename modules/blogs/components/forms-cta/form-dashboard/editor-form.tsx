"use client";
import { useContext } from "react";
import { Sun, Moon, Monitor, Smartphone, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormContext } from "./context/form-context";
import { useRouter } from "next/navigation";

interface EditorFormProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function EditorForm({
  activeTab,
  setActiveTab,
}: EditorFormProps) {
  const {
    theme,
    setTheme,
    device,
    setDevice,
    saveChanges,
    cancelChanges,
    refresh,
  } = useContext(FormContext);
  const router = useRouter();

  return (
    <header className="flex items-center justify-between px-4 py-1 border-b bg-background">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-[400px]"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="configure" className="text-normal font-normal">
              Configure
            </TabsTrigger>
            <TabsTrigger value="form" className="text-normal font-normal">
              Form
            </TabsTrigger>
            <TabsTrigger
              value="confirmation"
              className="text-normal font-normal"
            >
              Confirmation
            </TabsTrigger>
            <TabsTrigger value="action" className="text-normal font-normal">
              Action
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        {/* <Button variant="ghost" size="icon" onClick={refresh}>
          <RefreshCcw className="h-4 w-4" />
        </Button> */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDevice("desktop")}
        >
          <Monitor
            className={`h-4 w-4 ${
              device === "desktop" ? "text-foreground" : "text-muted-foreground"
            }`}
          />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setDevice("mobile")}>
          <Smartphone
            className={`h-4 w-4 ${
              device === "mobile" ? "text-foreground" : "text-muted-foreground"
            }`}
          />
        </Button>
        <Button variant="outline" onClick={cancelChanges} className="mx-2 h-8">
          Cancel
        </Button>
        <Button className="h-8" onClick={saveChanges}>
          Save
        </Button>
      </div>
    </header>
  );
}
