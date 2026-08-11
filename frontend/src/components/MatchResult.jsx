import React from "react";
import "./MatchResult.css";

export default function MatchResult({
  matchData,
  analysis,
  parsedJob,
  candidate,
  onContinueChat,
}) {
  if (!matchData) return null;

  const {
    match_score,
    matching_skills,
    missing_skills,
    matching_preferred_skills,
    relevant_experience,
    relevant_projects,
    experience_match,
    education_match,
  } = matchData;

  let scoreColorClass = "score-badge--low";
  if (match_score >= 70) scoreColorClass = "score-badge--high";
  else if (match_score >= 45) scoreColorClass = "score-badge--med";

  return (
    <div className="match-panel">
      {/* Top Banner */}
      <div className="match-banner">
        <div className="match-banner-info">
          <span className="match-banner-label">Candidate Evaluation</span>
          <h2 className="match-banner-title">
            {parsedJob?.job_title || "Target Role"}
          </h2>
          <p className="match-banner-candidate">
            Candidate: <strong>{candidate?.name || "Chinnu"}</strong>
          </p>
        </div>
        <div className={`match-score-pill ${scoreColorClass}`}>
          <div className="score-number">{Math.round(match_score)}%</div>
          <div className="score-tag">Match Score</div>
        </div>
      </div>

      {/* Skills Analysis Grid */}
      <div className="match-section">
        <h3 className="section-title">Skills Breakdown</h3>
        <div className="skills-columns">
          {/* Matching Skills */}
          <div className="skill-col">
            <h4 className="col-title col-title--match">
              <span className="col-icon">✓</span> Matching Skills (
              {matching_skills?.length || 0})
            </h4>
            <div className="skill-tag-group">
              {matching_skills && matching_skills.length > 0 ? (
                matching_skills.map((s, idx) => (
                  <span key={idx} className="match-tag match-tag--success">
                    ✓ {s}
                  </span>
                ))
              ) : (
                <span className="empty-text">No direct matches</span>
              )}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="skill-col">
            <h4 className="col-title col-title--missing">
              <span className="col-icon">✗</span> Missing / Gap Skills (
              {missing_skills?.length || 0})
            </h4>
            <div className="skill-tag-group">
              {missing_skills && missing_skills.length > 0 ? (
                missing_skills.map((s, idx) => (
                  <span key={idx} className="match-tag match-tag--danger">
                    ✗ {s}
                  </span>
                ))
              ) : (
                <span className="empty-text">None missing</span>
              )}
            </div>
          </div>
        </div>

        {/* Preferred Skills */}
        {matching_preferred_skills && matching_preferred_skills.length > 0 && (
          <div className="preferred-skills-row">
            <h4 className="col-title col-title--preferred">
              <span className="col-icon">★</span> Matching Preferred Skills
            </h4>
            <div className="skill-tag-group">
              {matching_preferred_skills.map((s, idx) => (
                <span key={idx} className="match-tag match-tag--preferred">
                  ★ {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Qualification Checks */}
      <div className="match-section">
        <h3 className="section-title">Qualification Checks</h3>
        <div className="qual-cards">
          <div className="qual-card">
            <span className="qual-card-label">Experience Criteria</span>
            <div
              className={`qual-card-status ${
                experience_match ? "status--pass" : "status--fail"
              }`}
            >
              {experience_match ? "✓ Meets requirement" : "✗ Requirement not met"}
            </div>
            {parsedJob?.minimum_experience_years != null && (
              <span className="qual-card-detail">
                Required: {parsedJob.minimum_experience_years} yrs | Candidate:{" "}
                {candidate?.total_experience_years || 1} yrs
              </span>
            )}
          </div>

          <div className="qual-card">
            <span className="qual-card-label">Education Criteria</span>
            <div
              className={`qual-card-status ${
                education_match ? "status--pass" : "status--fail"
              }`}
            >
              {education_match ? "✓ Meets requirement" : "Review required"}
            </div>
            <span className="qual-card-detail">
              {candidate?.education?.[0]?.degree || "B.Tech in DSAI"}
            </span>
          </div>
        </div>
      </div>

      {/* Relevant Experience */}
      {relevant_experience && relevant_experience.length > 0 && (
        <div className="match-section">
          <h3 className="section-title">Relevant Experience</h3>
          <ul className="relevant-list">
            {relevant_experience.map((exp, idx) => (
              <li key={idx} className="relevant-item">
                {exp}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Relevant Projects */}
      {relevant_projects && relevant_projects.length > 0 && (
        <div className="match-section">
          <h3 className="section-title">Relevant Projects</h3>
          <ul className="relevant-list">
            {relevant_projects.map((proj, idx) => (
              <li key={idx} className="relevant-item relevant-item--proj">
                {proj}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Candidate Suitability Analysis */}
      {analysis && (
        <div className="match-section">
          <h3 className="section-title">Candidate Suitability Analysis</h3>
          <div className="analysis-box">
            {analysis.split("\n").map((line, idx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={idx} className="analysis-spacer" />;
              if (trimmed.startsWith("## ")) {
                return (
                  <h4 key={idx} className="analysis-h">
                    {trimmed.slice(3)}
                  </h4>
                );
              }
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                return (
                  <li key={idx} className="analysis-li">
                    {trimmed.slice(2)}
                  </li>
                );
              }
              return (
                <p key={idx} className="analysis-p">
                  {trimmed}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {/* Continue Chat Action */}
      <div className="match-cta-bar">
        <button className="continue-chat-btn" onClick={onContinueChat}>
          <span>💬 Continue Chat with this Job Context</span>
          <span className="btn-arrow">→</span>
        </button>
      </div>
    </div>
  );
}
