"use client";
import { useContext } from "react";
import { FooterContext } from "../context/footer-context";
import DynamicFooter from "./dynamic-footer";

export default function ContentPanel() {
  const { theme } = useContext(FooterContext);

  const bg = theme === "dark" ? "bg-zinc-900" : "bg-gray-50";
  const box = theme === "dark" ? "bg-zinc-700" : "bg-gray-200";
  const card = theme === "dark" ? "bg-zinc-800" : "bg-gray-100";

  return (
    <div className={`min-h-full flex flex-col ${bg}`}>
      <div className="flex-grow p-4 sm:p-8 space-y-16">
        <div className="space-y-10">
          <div className={`h-12 w-2/3 rounded-lg ${box}`}></div>
          <div className="space-y-3">
            <div className={`h-4 w-5/6 rounded-md ${box}`}></div>
            <div className={`h-4 w-2/3 rounded-md ${box}`}></div>
          </div>
          <div className={`h-72 w-full rounded-xl ${box}`}></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`p-6 rounded-xl space-y-4 ${card}`}>
              <div className={`h-8 w-1/2 rounded-md ${box}`}></div>
              <div className={`h-4 w-full rounded-md ${box}`}></div>
              <div className={`h-32 w-full rounded-lg ${box}`}></div>
            </div>
          ))}
        </div>
      </div>

      <DynamicFooter />
    </div>
  );
}
