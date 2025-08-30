"use client";
import { createContext, useState, ReactNode } from "react";

export type DeviceType = "desktop" | "mobile";
export type ThemeType = "light" | "dark";

export interface HeaderItem {
  id: string;
  type: "Link" | "List" | "Button";
  name: string;
  link?: string;
  children?: HeaderItem[];
}

export interface HeaderStyle {
  height: number;
  backgroundColorLight: string;
  textColorLight: string;
  backgroundColorDark: string;
  textColorDark: string;
  sticky: boolean;
}

interface HeaderContextType {
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  headerItems: HeaderItem[];
  setHeaderItems: (items: HeaderItem[]) => void;
  headerStyle: HeaderStyle;
  setHeaderStyle: (style: HeaderStyle) => void;
  addItem: (item: HeaderItem) => void;
  updateItem: (item: HeaderItem) => void;
  deleteItem: (id: string) => void;

  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  device: DeviceType;
  setDevice: (d: DeviceType) => void;
  saveChanges: () => void;
  cancelChanges: () => void;
  refresh: () => void;
}

const initialState: HeaderContextType = {
  logoUrl: "https://inblog.ai/logo.svg",
  setLogoUrl: () => {},
  headerItems: [],
  setHeaderItems: () => {},
  headerStyle: {
    height: 60,
    backgroundColorLight: "#FFFFFF",
    textColorLight: "#000000",
    backgroundColorDark: "#18181B",
    textColorDark: "#FFFFFF",
    sticky: false,
  },
  setHeaderStyle: () => {},
  addItem: () => {},
  updateItem: () => {},
  deleteItem: () => {},
  theme: "light",
  setTheme: () => {},
  device: "desktop",
  setDevice: () => {},
  saveChanges: () => {},
  cancelChanges: () => {},
  refresh: () => {},
};

export const HeaderContext = createContext<HeaderContextType>(initialState);

export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [logoUrl, setLogoUrl] = useState(initialState.logoUrl);
  const [headerItems, setHeaderItems] = useState<HeaderItem[]>([
    { id: "1", name: "Blog", type: "Link", link: "#" },
    { id: "2", name: "Customers", type: "Link", link: "#" },
    { id: "3", name: "Pricing", type: "Link", link: "#" },
    { id: "4", name: "Resources", type: "List", children: [] },
  ]);
  const [headerStyle, setHeaderStyle] = useState(initialState.headerStyle);
  const [theme, setTheme] = useState<ThemeType>("light");
  const [device, setDevice] = useState<DeviceType>("desktop");

  const addItem = (item: HeaderItem) => {
    setHeaderItems([...headerItems, { ...item, id: Date.now().toString() }]);
  };

  const updateItem = (updatedItem: HeaderItem) => {
    setHeaderItems(
      headerItems.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setHeaderItems(headerItems.filter((item) => item.id !== id));
  };

  const saveChanges = () => {
    console.log("Saved:", {
      logoUrl,
      headerItems,
      headerStyle,
      theme,
      device,
    });
  };

  const cancelChanges = () => {
    console.log("Cancelled changes");
  };

  const refresh = () => {
    console.log("Refreshed preview!");
  };

  return (
    <HeaderContext.Provider
      value={{
        logoUrl,
        setLogoUrl,
        headerItems,
        setHeaderItems,
        headerStyle,
        setHeaderStyle,
        addItem,
        updateItem,
        deleteItem,
        theme,
        setTheme,
        device,
        setDevice,
        saveChanges,
        cancelChanges,
        refresh,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
};
