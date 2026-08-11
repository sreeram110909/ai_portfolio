import React from "react";
import "./LogoutModal.css";

export default function LogoutModal({ isOpen, onClose, onConfirmLogout }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="logout-modal-header">
          <div className="logout-icon-wrapper">
            <svg
              width="20"
              height="20"
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
          </div>
          <div>
            <h3 className="logout-modal-title">Sign Out</h3>
            <p className="logout-modal-desc">
              Are you sure you want to sign out of your account?
            </p>
          </div>
        </div>

        <div className="logout-modal-actions">
          <button className="logout-cancel-btn" onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className="logout-confirm-btn"
            onClick={() => {
              onConfirmLogout();
              onClose();
            }}
            type="button"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
