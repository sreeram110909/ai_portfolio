import React from "react";
import "./SettingsModal.css";

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  onClearAllHistory,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Settings</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Theme setting */}
          <div className="setting-row">
            <div>
              <div className="setting-label">Interface Theme</div>
              <div className="setting-desc">Switch between light and dark modes</div>
            </div>
            <button className="theme-toggle-btn" onClick={onToggleTheme}>
              {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
            </button>
          </div>

          {/* History setting */}
          <div className="setting-row">
            <div>
              <div className="setting-label">Chat History</div>
              <div className="setting-desc">
                Permanently delete all locally stored conversation sessions
              </div>
            </div>
            <button
              className="danger-btn"
              onClick={() => {
                if (window.confirm("Are you sure you want to delete all chat history?")) {
                  onClearAllHistory();
                  onClose();
                }
              }}
            >
              Clear History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
