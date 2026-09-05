"use client";

import React, { useState, useRef } from "react";

interface MessageInputProps {
  onSend: (text: string, file?: File) => void;
  disabled?: boolean;
}

function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (disabled) return;
    if (!text.trim() && !file) return;
    onSend(text.trim(), file || undefined);
    setText("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="border-t border-gray-200 p-3 dark:border-gray-700">
      {file && (
        <div className="mb-2 flex items-center gap-2 rounded bg-gray-100 p-2 text-sm dark:bg-gray-800">
          <i className="fa fa-paperclip"></i>
          <span className="flex-1 truncate">{file.name}</span>
          <button onClick={() => setFile(null)} className="text-red-500 hover:text-red-700">
            <i className="fa fa-times"></i>
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <i className="fa fa-paperclip text-xl"></i>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="پیام خود را بنویسید..."
          className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          disabled={disabled}
        />
        <button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !file)}
          className="rounded-xl bg-rose-600 px-4 py-2 text-white transition hover:bg-rose-700 disabled:opacity-50"
        >
          <i className="fa fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
}

export default MessageInput;