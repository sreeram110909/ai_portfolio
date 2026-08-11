import React from "react";
import "./LoadingMessage.css";

export default function LoadingMessage({ statusText = "Thinking..." }) {
  return (
    <div className="chat-row chat-row--ai">
      <div className="message-wrapper">
        <div className="message-avatar">C</div>
        <div className="message-body">
          <div className="message-header">
            <span className="message-author">Chinnu AI</span>
          </div>
          <div className="loading-dots-container">
            <span className="loading-status-text">{statusText}</span>
            <div className="typing-dots">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
