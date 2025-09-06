"use client";
import { createContext, useState, ReactNode } from "react";
import { produce } from "immer";

// --- Type Definitions ---
export type DeviceType = "desktop" | "mobile";
export type ThemeType = "light" | "dark";
export type CtaType = "EndOfPost" | "Sidebar" | "InLine" | "PopUp" | "Floating";
export type CtaTrigger = "TimeDelay" | "Scroll" | "ExitIntent";

export interface CtaState {
  ctaName: string;
  type: CtaType;
  category: string;
  trigger: CtaTrigger;
  timeDelay: number;
  scrollTrigger: number;
  content: {
    heading: string;
    description: string;
    primaryButton: { text: string; url: string };
    secondaryButton: { text: string; url: string };
    footnote: string;
  };
  customCode: { isEnabled: boolean; code: string };
}

interface CtaContextType {
  ctaState: CtaState;
  setCtaState: (state: CtaState) => void;
  updateField: <K extends keyof CtaState>(field: K, value: CtaState[K]) => void;
  updateContentField: <K extends keyof CtaState["content"]>(
    field: K,
    value: CtaState["content"][K]
  ) => void;
  setCustomCode: (code: string) => void;
  setCustomCodeEnabled: (isEnabled: boolean) => void;
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  device: DeviceType;
  setDevice: (d: DeviceType) => void;
  saveChanges: () => void;
  cancelChanges: () => void;
  refresh: () => void;
  setActiveTab: (tab: string) => void;
}

export const CtaContext = createContext<CtaContextType>(null!);

const initialState: CtaState = {
  ctaName: "Homepage Welcome CTA",
  type: "PopUp",
  category: "Global",
  trigger: "TimeDelay",
  timeDelay: 5,
  scrollTrigger: 50,
  content: {
    heading: "This is a big heading for the callout section of the page",
    description: "This is a subheading for the callout section",
    primaryButton: { text: "Main Button", url: "#" },
    secondaryButton: { text: "Secondary", url: "#" },
    footnote: "This is a small footnote.",
  },
  customCode: { isEnabled: false, code: "" },
};

export const CtaProvider = ({
  children,
  passedSetActiveTab,
}: {
  children: ReactNode;
  passedSetActiveTab: (tab: string) => void;
}) => {
  const [ctaState, setCtaState] = useState<CtaState>(initialState);
  const [theme, setTheme] = useState<ThemeType>("light");
  const [device, setDevice] = useState<DeviceType>("desktop");

  const updateField = <K extends keyof CtaState>(
    field: K,
    value: CtaState[K]
  ) => {
    setCtaState(
      produce((draft) => {
        (draft as any)[field] = value;
      })
    );
  };
  const updateContentField = <K extends keyof CtaState["content"]>(
    field: K,
    value: CtaState["content"][K]
  ) => {
    setCtaState(
      produce((draft) => {
        (draft.content as any)[field] = value;
      })
    );
  };
  const setCustomCode = (code: string) => {
    setCtaState(
      produce((draft) => {
        draft.customCode.code = code;
      })
    );
  };
  const setCustomCodeEnabled = (isEnabled: boolean) => {
    setCtaState(
      produce((draft) => {
        draft.customCode.isEnabled = isEnabled;
      })
    );
  };
  const saveChanges = () => console.log("Saved CTA:", ctaState);
  const cancelChanges = () => console.log("Cancelled changes");
  const refresh = () => console.log("Refreshed preview!");

  return (
    <CtaContext.Provider
      value={{
        ctaState,
        setCtaState,
        updateField,
        updateContentField,
        setCustomCode,
        setCustomCodeEnabled,
        theme,
        setTheme,
        device,
        setDevice,
        saveChanges,
        cancelChanges,
        refresh,
        setActiveTab: passedSetActiveTab,
      }}
    >
      {children}
    </CtaContext.Provider>
  );
};
