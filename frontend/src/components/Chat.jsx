import React, { useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import MessageComposer from "./MessageComposer";
import WelcomeScreen from "./WelcomeScreen";
import LoadingMessage from "./LoadingMessage";
import "./Chat.css";

export default function Chat({
  messages,
  onSendMessage,
  loading,
  loadingStatus,
  candidate,
  currentJobDescription,
  currentMatchResult,
  onClearJobContext,
  onOpenJobAnalysis,
  onOpenMobileMenu,
}) {
  const [input, setInput] = React.useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleSend() {
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput("");
  }

  function handleSelectPrompt(promptText) {
    onSendMessage(promptText);
  }

  return (
    <div className="chat-container">
      {/* Top chat bar */}
      <header className="chat-topbar">
        <button
          className="mobile-menu-btn"
          onClick={onOpenMobileMenu}
          aria-label="Open sidebar"
        >
          ☰
        </button>
        <div className="chat-topbar-title">
          <span className="chat-title-main">
            {candidate?.name || "Chinnu"}’s AI Portfolio
          </span>
          {currentJobDescription && (
            <span className="chat-title-badge">
              Matching: {currentJobDescription.job_title || "Job"}
            </span>
          )}
        </div>
      </header>

      {/* Messages stream */}
      <div className="chat-stream">
        {messages.length === 0 ? (
          <WelcomeScreen
            onSelectPrompt={handleSelectPrompt}
            candidate={candidate}
          />
        ) : (
          <div className="messages-list">
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} message={msg} />
            ))}

            {loading && <LoadingMessage statusText={loadingStatus || "Thinking..."} />}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Composer */}
      <div className="chat-bottom">
        <MessageComposer
          input={input}
          setInput={setInput}
          onSend={handleSend}
          loading={loading}
          currentJobDescription={currentJobDescription}
          currentMatchResult={currentMatchResult}
          onClearJobContext={onClearJobContext}
          onOpenJobAnalysis={onOpenJobAnalysis}
        />
      </div>
    </div>
  );
}
