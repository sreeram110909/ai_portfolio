import React, { useState } from "react";
import "./ChatMessage.css";

export default function ChatMessage({ message }) {
  const isRecruiter = message.role === "recruiter";
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Format AI text nicely (simple markdown parsing)
  function renderFormattedContent(content) {
    if (!content) return null;
    const lines = content.split("\n");

    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="msg-break" />;

      if (trimmed.startsWith("### ")) {
        return (
          <h4 key={idx} className="msg-h4">
            {trimmed.slice(4)}
          </h4>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h3 key={idx} className="msg-h3">
            {trimmed.slice(3)}
          </h3>
        );
      }
      if (trimmed.startsWith("# ")) {
        return (
          <h2 key={idx} className="msg-h2">
            {trimmed.slice(2)}
          </h2>
        );
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return (
          <li key={idx} className="msg-li">
            {trimmed.slice(2)}
          </li>
        );
      }
      if (/^\d+\.\s/.test(trimmed)) {
        return (
          <div key={idx} className="msg-num-item">
            {trimmed}
          </div>
        );
      }

      return (
        <p key={idx} className="msg-p">
          {trimmed}
        </p>
      );
    });
  }

  return (
    <div className={`chat-row ${isRecruiter ? "chat-row--user" : "chat-row--ai"}`}>
      <div className="message-wrapper">
        {/* Avatar */}
        <div className="message-avatar" aria-hidden="true">
          {isRecruiter ? "R" : "C"}
        </div>

        {/* Content */}
        <div className="message-body">
          <div className="message-header">
            <span className="message-author">
              {isRecruiter ? "Recruiter" : "Chinnu AI"}
            </span>
            <button
              className="copy-btn"
              onClick={handleCopy}
              title="Copy message"
              aria-label="Copy message"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="message-content">
            {isRecruiter ? (
              <p>{message.content}</p>
            ) : (
              renderFormattedContent(message.content)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
