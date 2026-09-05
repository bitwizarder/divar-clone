"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// داینامیک ایمپورت با غیرفعال‌سازی کامل SSR
const CKEditor = dynamic(
  () => import("@ckeditor/ckeditor5-react").then((mod) => mod.CKEditor),
  { ssr: false }
);

// ایمپورت استاتیک ClassicEditor (فقط در کلاینت بار می‌شود)
let ClassicEditor: any = null;
if (typeof window !== "undefined") {
  ClassicEditor = require("@ckeditor/ckeditor5-build-classic");
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [editor, setEditor] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    // بارگذاری ClassicEditor در سمت کلاینت
    if (typeof window !== "undefined") {
      import("@ckeditor/ckeditor5-build-classic").then((mod) =>
        setEditor(() => mod.default)
      );
    }
  }, []);

  if (!isMounted || !editor) {
    return (
      <div className="min-h-32 w-full rounded-xl border border-gray-300 bg-gray-50 p-4 text-gray-500">
        در حال بارگذاری ویرایشگر...
      </div>
    );
  }

  return (
    <div className="rich-editor-wrapper">
      <CKEditor
        editor={editor}
        onChange={(event: any, editorInstance: any) => {
          const data = editorInstance.getData();
          onChange(data);
        }}
        config={{
          placeholder: placeholder || "متن خود را اینجا وارد کنید...",
          language: "fa",
          toolbar: {
            items: [
              "heading",
              "|",
              "bold",
              "italic",
              "numberedList",
              
              "|",
              
              "bulletedList",
              "numberedList",
              "|",
              "link",
              "blockQuote",
              "insertTable",
              "|",
              "undo",
              "redo",
            ],
          },
        }}
      />
    </div>
  );
}

export default RichTextEditor;