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
  currentUser,
  onOpenAuth,
  onLogout,
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
            <span className="btn-icon">+</span>
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
                  <span className="history-icon">💬</span>
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
                  >
                    🗑
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
            <span className="nav-icon">💬</span>
            <span className="nav-text">Conversation</span>
          </button>

          <button
            className={`nav-item ${activeView === "profile" ? "nav-item--active" : ""}`}
            onClick={() => {
              setActiveView("profile");
              if (onCloseMobile) onCloseMobile();
            }}
          >
            <span className="nav-icon">👤</span>
            <span className="nav-text">Candidate Profile</span>
          </button>

          <button
            className={`nav-item ${activeView === "job" ? "nav-item--active" : ""}`}
            onClick={() => {
              setActiveView("job");
              if (onCloseMobile) onCloseMobile();
            }}
          >
            <span className="nav-icon">📊</span>
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
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Settings</span>
          </button>

          {/* User Account / Auth Section */}
          <div className="sidebar-auth-row">
            {currentUser ? (
              <div className="auth-user-card">
                <div className="user-avatar">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : "U"}
                </div>
                <div className="user-info">
                  <span className="user-name">
                    {currentUser.name || currentUser.email.split("@")[0]}
                  </span>
                  <span className="user-email">{currentUser.email}</span>
                </div>
                <button
                  className="auth-logout-btn"
                  onClick={onLogout}
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </button>
              </div>
            ) : (
              <button className="auth-login-btn" onClick={onOpenAuth}>
                <span className="auth-login-icon">👤</span>
                <span>Sign In / Sign Up</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
