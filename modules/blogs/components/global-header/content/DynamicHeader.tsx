"use client";
import { useContext } from "react";
import { HeaderContext } from "../context/HeaderContext";
import Image from "next/image";

export default function DynamicHeader() {
  const { logoUrl, headerItems, headerStyle } = useContext(HeaderContext);

  const isDarkMode = false;
  const currentStyle = {
    height: `${headerStyle.height}px`,
    backgroundColor: isDarkMode
      ? headerStyle.backgroundColorDark
      : headerStyle.backgroundColorLight,
    color: isDarkMode ? headerStyle.textColorDark : headerStyle.textColorLight,
  };

  return (
    <header
      className="flex justify-between items-center px-8 w-full transition-all duration-300"
      style={currentStyle}
    >
      <div>
        <Image src={logoUrl} alt="logo" width={100} height={40} />
      </div>
      <nav className="flex items-center gap-6">
        {headerItems.map((item) => {
          if (item.type === "Button") {
            return (
              <button
                key={item.id}
                className="px-4 py-2 rounded-md border border-transparent bg-black text-white text-sm font-medium transition-opacity hover:opacity-80"
              >
                {item.name}
              </button>
            );
          }
          return (
            <a
              key={item.id}
              href={item.link}
              className="text-sm font-medium transition-opacity hover:opacity-70"
            >
              {item.name}
            </a>
          );
        })}
      </nav>
    </header>
  );
}
