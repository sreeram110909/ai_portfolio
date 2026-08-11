import React from "react";
import "./Sidebar.css";

export default function Sidebar({
  activeView,
  setActiveView,
  chatSessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  currentJobDescription,
  currentMatchResult,
  onClearJobContext,
  onOpenSettings,
  isOpen,
  onCloseMobile,
}) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onCloseMobile} />}

      <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
        {/* Brand header */}
        <div className="sidebar-header">
          <div className="sidebar-brand" onClick={() => setActiveView("chat")}>
            <div className="brand-avatar">C</div>
            <div className="brand-text">
              <h1 className="brand-title">Chinnu AI</h1>
              <p className="brand-subtitle">AI Candidate Assistant</p>
            </div>
          </div>
          <button
            className="mobile-close-btn"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* New chat button */}
        <div className="sidebar-action">
          <button className="new-chat-btn" onClick={onNewChat}>
            <svg
              className="btn-icon-svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>New Chat</span>
          </button>
        </div>

        {/* Active job context badge if present */}
        {currentJobDescription && (
          <div className="sidebar-job-badge">
            <div className="job-badge-header">
              <span className="job-badge-title">Active Job Match</span>
              <button
                className="job-badge-clear"
                onClick={onClearJobContext}
                title="Clear job context"
              >
                ✕
              </button>
            </div>
            <div className="job-badge-content" onClick={() => setActiveView("job")}>
              <span className="job-badge-role">
                {currentJobDescription.job_title || "Evaluated Role"}
              </span>
              {currentMatchResult?.match_score != null && (
                <span className="job-badge-score">
                  {Math.round(currentMatchResult.match_score)}% Match
                </span>
              )}
            </div>
          </div>
        )}

        {/* Chat history list */}
        <div className="sidebar-history">
          <div className="history-label">Recent Chats</div>
          <div className="history-list">
            {chatSessions.length === 0 ? (
              <div className="history-empty">No previous chats</div>
            ) : (
              chatSessions.map((session) => (
                <div
                  key={session.id}
                  className={`history-item ${
                    activeView === "chat" && currentSessionId === session.id
                      ? "history-item--active"
                      : ""
                  }`}
                  onClick={() => {
                    onSelectSession(session.id);
                    setActiveView("chat");
                    if (onCloseMobile) onCloseMobile();
                  }}
                >
                  <svg
                    className="history-icon-svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span className="history-title" title={session.title}>
                    {session.title || "Recruiter Conversation"}
                  </span>
                  <button
                    className="history-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    title="Delete chat"
                    aria-label="Delete chat"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Navigation bottom menu */}
        <div className="sidebar-nav">
          <button
            className={`nav-item ${activeView === "chat" ? "nav-item--active" : ""}`}
            onClick={() => {
              setActiveView("chat");
              if (onCloseMobile) onCloseMobile();
            }}
          >
            <svg
              className="nav-icon-svg"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span className="nav-text">Conversation</span>
          </button>

          <button
            className={`nav-item ${activeView === "profile" ? "nav-item--active" : ""}`}
            onClick={() => {
              setActiveView("profile");
              if (onCloseMobile) onCloseMobile();
            }}
          >
            <svg
              className="nav-icon-svg"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span className="nav-text">Candidate Profile</span>
          </button>

          <button
            className={`nav-item ${activeView === "job" ? "nav-item--active" : ""}`}
            onClick={() => {
              setActiveView("job");
              if (onCloseMobile) onCloseMobile();
            }}
          >
            <svg
              className="nav-icon-svg"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <span className="nav-text">Analyze Job</span>
            {currentMatchResult && <span className="nav-dot" />}
          </button>

          <button
            className="nav-item"
            onClick={() => {
              onOpenSettings();
              if (onCloseMobile) onCloseMobile();
            }}
          >
            <svg
              className="nav-icon-svg"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span className="nav-text">Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
}
