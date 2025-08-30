"use client";
import { createContext, useState, ReactNode } from "react";

export type DeviceType = "desktop" | "mobile";
export type ThemeType = "light" | "dark";
export type ItemType = "Link" | "List" | "Button";
export type Alignment = "left" | "center" | "right";
export type ButtonStyle = "solid" | "outline";

// Sub-item type for clarity
export interface SubHeaderItem {
  id: string;
  name: string;
  link: string;
  order: number;
  openInNewTab: boolean;
}

export interface HeaderItem {
  id: string;
  name: string;
  type: ItemType;
  order: number;
  alignment: Alignment;
  link?: string;
  openInNewTab?: boolean;
  buttonStyle?: ButtonStyle;
  textColor?: string;
  buttonColor?: string;
  children?: SubHeaderItem[];
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
  logoUrls: { light: string; dark: string };
  setLogoUrl: (mode: ThemeType, url: string) => void;
  headerItems: HeaderItem[];
  setHeaderItems: (items: HeaderItem[]) => void;
  headerStyle: HeaderStyle;
  setHeaderStyle: (style: HeaderStyle) => void;
  addItem: (item: Omit<HeaderItem, "id" | "order">) => void;
  updateItem: (item: HeaderItem) => void;
  deleteItem: (id: string) => void;
  toggleAlignment: (id: string) => void; // Added
  addSubItem: (
    parentId: string,
    subItem: Omit<SubHeaderItem, "id" | "order">
  ) => void;
  updateSubItem: (parentId: string, subItem: SubHeaderItem) => void;
  deleteSubItem: (parentId: string, subItemId: string) => void;
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  device: DeviceType;
  setDevice: (d: DeviceType) => void;
  saveChanges: () => void;
  cancelChanges: () => void;
  refresh: () => void;
}

export const HeaderContext = createContext<HeaderContextType>(null!);

export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [logoUrls, setLogoUrls] = useState({ light: "", dark: "" });
  const [headerItems, setHeaderItems] = useState<HeaderItem[]>([
    {
      id: "1",
      name: "About",
      type: "Link",
      link: "#",
      order: 0,
      alignment: "left",
      openInNewTab: false,
      textColor: "#000000",
    },
    {
      id: "2",
      name: "Resources",
      type: "List",
      order: 1,
      alignment: "left",
      children: [
        { id: "sub-1", name: "Guide", link: "#", order: 0, openInNewTab: true },
        { id: "sub-2", name: "Blog", link: "#", order: 1, openInNewTab: false },
      ],
    },
    {
      id: "3",
      name: "Log In",
      type: "Button",
      order: 2,
      alignment: "right",
      buttonStyle: "outline",
      textColor: "#000000",
      buttonColor: "#FFFFFF",
    },
    {
      id: "4",
      name: "Get Started",
      type: "Button",
      order: 3,
      alignment: "right",
      buttonStyle: "solid",
      textColor: "#FFFFFF",
      buttonColor: "#000000",
    },
  ]);
  const [headerStyle, setHeaderStyle] = useState({
    height: 60,
    backgroundColorLight: "#FFFFFF",
    textColorLight: "#000000",
    backgroundColorDark: "#18181B",
    textColorDark: "#FFFFFF",
    sticky: false,
  });
  const [theme, setTheme] = useState<ThemeType>("light");
  const [device, setDevice] = useState<DeviceType>("desktop");

  const setLogoUrl = (mode: ThemeType, url: string) => {
    setLogoUrls((prev) => ({ ...prev, [mode]: url }));
  };

  const addItem = (item: Omit<HeaderItem, "id" | "order">) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      order: headerItems.length,
    };
    setHeaderItems([...headerItems, newItem]);
  };

  const updateItem = (updatedItem: HeaderItem) => {
    setHeaderItems(
      headerItems.map((item) =>
        item.id === updatedItem.id ? { ...item, ...updatedItem } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setHeaderItems(headerItems.filter((item) => item.id !== id));
  };

  const toggleAlignment = (id: string) => {
    setHeaderItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const alignments: Alignment[] = ["left", "center", "right"];
          const currentIndex = alignments.indexOf(item.alignment);
          const nextIndex = (currentIndex + 1) % alignments.length;
          return { ...item, alignment: alignments[nextIndex] };
        }
        return item;
      })
    );
  };

  const addSubItem = (
    parentId: string,
    subItem: Omit<SubHeaderItem, "id" | "order">
  ) => {
    const newSubItem = { ...subItem, id: `sub-${Date.now()}`, order: 0 };
    setHeaderItems(
      headerItems.map((item) => {
        if (item.id === parentId) {
          const children = item.children || [];
          newSubItem.order = children.length;
          return { ...item, children: [...children, newSubItem] };
        }
        return item;
      })
    );
  };

  const updateSubItem = (parentId: string, updatedSubItem: SubHeaderItem) => {
    setHeaderItems(
      headerItems.map((item) => {
        if (item.id === parentId) {
          const updatedChildren = item.children?.map((child) =>
            child.id === updatedSubItem.id ? updatedSubItem : child
          );
          return { ...item, children: updatedChildren };
        }
        return item;
      })
    );
  };

  const deleteSubItem = (parentId: string, subItemId: string) => {
    setHeaderItems(
      headerItems.map((item) => {
        if (item.id === parentId) {
          const filteredChildren = item.children?.filter(
            (child) => child.id !== subItemId
          );
          return { ...item, children: filteredChildren };
        }
        return item;
      })
    );
  };

  const saveChanges = () =>
    console.log("Saved:", { logoUrls, headerItems, headerStyle });
  const cancelChanges = () => console.log("Cancelled changes");
  const refresh = () => console.log("Refreshed preview!");

  return (
    <HeaderContext.Provider
      value={{
        logoUrls,
        setLogoUrl,
        headerItems,
        setHeaderItems,
        headerStyle,
        setHeaderStyle,
        addItem,
        updateItem,
        deleteItem,
        toggleAlignment,
        addSubItem,
        updateSubItem,
        deleteSubItem,
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
