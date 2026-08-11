import React, { useRef, useEffect } from "react";
import "./MessageComposer.css";

export default function MessageComposer({
  input,
  setInput,
  onSend,
  loading,
  currentJobDescription,
  currentMatchResult,
  onClearJobContext,
  onOpenJobAnalysis,
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        160
      )}px`;
    }
  }, [input]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="composer-container">
      {/* Context pill if a JD match is active */}
      {currentJobDescription && (
        <div className="composer-context-pill">
          <span className="context-icon">💼</span>
          <span className="context-text" onClick={onOpenJobAnalysis}>
            Context: <strong>{currentJobDescription.job_title || "Job Match"}</strong>
            {currentMatchResult?.match_score != null && (
              <span> ({Math.round(currentMatchResult.match_score)}% match)</span>
            )}
          </span>
          <button
            className="context-clear-btn"
            onClick={onClearJobContext}
            title="Clear job description context"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input box */}
      <div className="composer-box">
        <textarea
          ref={textareaRef}
          className="composer-textarea"
          placeholder="Ask a question about Chinnu's skills, projects, or background..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={loading}
          id="recruiter-chat-input"
        />
        <button
          className={`composer-send-btn ${
            input.trim() && !loading ? "composer-send-btn--active" : ""
          }`}
          onClick={onSend}
          disabled={!input.trim() || loading}
          aria-label="Send message"
          id="recruiter-send-btn"
        >
          ↑
        </button>
      </div>

      <div className="composer-footer">
        Chinnu's AI assistant answers based strictly on verified portfolio and resume data.
      </div>
    </div>
  );
}
