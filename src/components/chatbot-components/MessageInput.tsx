"use client";
import { SendHorizonal } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

interface MessageInputProps {
  placeholder?: string;
  onSend?: (message: string) => void;
  styles?: string;
  disabled?: boolean;
}

export default function MessageInput({
  placeholder = "Type a message...",
  onSend,
  styles = "",
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Adjust textarea height dynamically with min and max constraints
  const adjustTextareaHeight = () => {
    const textarea = textAreaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Reset to auto first
      // const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 150); // Between 40px and 150px
      // textarea.style.height = `${newHeight}px`;
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;

    }
  };

  // Adjust height whenever the message changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleSend = () => {
    if (onSend && message.trim()) {
      onSend(message.trim());
      setMessage("");
      adjustTextareaHeight(); // Reset height after sending
      textAreaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <form
      className={`flex items-center gap-2 px-5 rounded-md ${styles}`}
      onSubmit={(e) => {
        e.preventDefault();
        handleSend();
      }}
    >
<textarea
  ref={textAreaRef}
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  autoFocus={true}
            rows={1}
  onKeyDown={handleKeyDown}
  placeholder={placeholder}
  className={`w-full bg-transparent outline-none border-none text-[#231F20] resize-none p-2 rounded-lg`}
  style={{
    minHeight: "40px",   // Minimum height of the textarea
    maxHeight: "76px",  // Maximum height before scrollbar appears
    overflowY: "auto",   // Show scrollbar when content overflows
    wordWrap: "break-word", // Prevent horizontal overflow
    WebkitOverflowScrolling: "touch", // For smooth scroll experience on iOS
      scrollbarWidth: "none", // For Firefox
  }}
  disabled={disabled}
/>


      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className={`p-2 text-[#231F20] disabled:opacity-50`}
      >
        <SendHorizonal />
      </button>
    </form>
  );
}
