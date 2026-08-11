import React from "react";
import "./WelcomeScreen.css";

export default function WelcomeScreen({ onSelectPrompt, candidate }) {
  const suggestions = [
    "Tell me about yourself.",
    "What are his strongest technical skills?",
    "Does he have backend experience?",
    "What projects has he worked on?",
    "Does he know Python?",
    "Tell me about his education background.",
  ];

  return (
    <div className="welcome-screen">
      <div className="welcome-avatar">C</div>
      <h2 className="welcome-title">
        {candidate?.name ? `${candidate.name}'s AI Assistant` : "Chinnu AI Portfolio"}
      </h2>
      <p className="welcome-subtitle">
        I represent Chinnu and can answer recruiter questions about his engineering
        skills, project architecture, work experience, and role suitability.
      </p>

      <div className="welcome-suggestions-label">Try asking:</div>

      <div className="welcome-suggestions">
        {suggestions.map((prompt, idx) => (
          <button
            key={idx}
            className="suggestion-chip"
            onClick={() => onSelectPrompt(prompt)}
          >
            <span className="suggestion-text">{prompt}</span>
            <span className="suggestion-arrow">↗</span>
          </button>
        ))}
      </div>
    </div>
  );
}
