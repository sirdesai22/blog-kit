"use client";

import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

export default function DescriptionEditor({ value, onChange }: any) {
  const modules = {
    toolbar: [["bold", "italic", "underline", "link"]],
  };

  const formats = ["bold", "italic", "underline", "link"];

  return (
    <div className="h-[120px]">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        className="h-[80px]"
      />
    </div>
  );
}
