import React, { useState } from "react";
import { signInUser, signUpUser, getErrorMessage } from "../api/client";
import "./AuthModal.css";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (mode === "signup" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      let res;
      if (mode === "signup") {
        res = await signUpUser(email.trim(), password, name.trim() || null);
      } else {
        res = await signInUser(email.trim(), password);
      }
      onAuthSuccess(res.user);
      onClose();
      // Reset form
      setEmail("");
      setPassword("");
      setName("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function handleSwitchMode(newMode) {
    setMode(newMode);
    setError(null);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="auth-header">
          <div className="auth-brand">
            <div className="auth-avatar">C</div>
            <div>
              <h3 className="auth-title">
                {mode === "signin" ? "Sign in to Chinnu AI" : "Create an Account"}
              </h3>
              <p className="auth-desc">
                {mode === "signin"
                  ? "Welcome back! Sign in to sync your recruiter sessions."
                  : "Sign up to save your candidate conversations and evaluations."}
              </p>
            </div>
          </div>
          <button className="auth-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error-banner">{error}</div>}

          {mode === "signup" && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name">
                Full Name <span className="label-optional">(optional)</span>
              </label>
              <input
                id="auth-name"
                type="text"
                className="form-input"
                placeholder="e.g. Sarah Jenkins"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              className="form-input"
              placeholder="recruiter@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading || !email.trim() || !password.trim()}
          >
            {loading
              ? mode === "signin"
                ? "Signing in..."
                : "Creating account..."
              : mode === "signin"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        {/* Footer switch mode */}
        <div className="auth-footer">
          {mode === "signin" ? (
            <p>
              Don't have an account yet?{" "}
              <button
                type="button"
                className="switch-mode-btn"
                onClick={() => handleSwitchMode("signup")}
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="switch-mode-btn"
                onClick={() => handleSwitchMode("signin")}
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
