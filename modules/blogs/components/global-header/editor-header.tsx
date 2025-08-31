"use client";
import { useContext } from "react";
import {
  Sun,
  Moon,
  Monitor,
  Tablet,
  Smartphone,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeaderContext } from "./context/header-context";
import { useRouter } from "next/navigation";

interface EditorHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function EditorHeader({
  activeTab,
  setActiveTab,
}: EditorHeaderProps) {
  const {
    theme,
    setTheme,
    device,
    setDevice,
    saveChanges,
    cancelChanges,
    headerItems,
    refresh,
  } = useContext(HeaderContext);

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
          className="w-[250px]"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="items" className="text-normal font-normal">
              Header Items
            </TabsTrigger>
            <TabsTrigger value="style" className="text-normal font-normal">
              Header Style
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center ">
        {/* Theme toggle */}
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

        <Button variant="ghost" size="icon" onClick={refresh}>
          <RefreshCcw className="h-4 w-4" />
        </Button>

        {/* Device switch */}
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

        {/* Actions */}
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
