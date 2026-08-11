import React from "react";
import "./Profile.css";

export default function Profile({ candidate, onStartChat, onOpenMobileMenu }) {
  if (!candidate) {
    return (
      <div className="profile-container">
        <header className="profile-topbar">
          <button className="mobile-menu-btn" onClick={onOpenMobileMenu}>
            ☰
          </button>
          <h2 className="profile-topbar-title">Candidate Profile</h2>
        </header>
        <div className="profile-loading">Loading candidate profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Top bar */}
      <header className="profile-topbar">
        <button className="mobile-menu-btn" onClick={onOpenMobileMenu}>
          ☰
        </button>
        <h2 className="profile-topbar-title">Candidate Profile</h2>
        <button className="profile-chat-btn" onClick={onStartChat}>
          <span>💬</span>
          <span>Ask AI about Chinnu</span>
        </button>
      </header>

      {/* Main scrollable body */}
      <div className="profile-content">
        <div className="profile-inner">
          {/* Header Card */}
          <div className="profile-card profile-hero">
            <div className="hero-avatar">C</div>
            <div className="hero-details">
              <h1 className="hero-name">{candidate.name}</h1>
              <p className="hero-headline">
                B.Tech in Data Science & Artificial Intelligence, IIT Guwahati
              </p>
              <div className="hero-contacts">
                {candidate.email && (
                  <span className="contact-item">
                    📧 <a href={`mailto:${candidate.email}`}>{candidate.email}</a>
                  </span>
                )}
                {candidate.phone && (
                  <span className="contact-item">📞 {candidate.phone}</span>
                )}
                {candidate.linkedin && (
                  <span className="contact-item">
                    🔗{" "}
                    <a
                      href={`https://${candidate.linkedin}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {candidate.linkedin}
                    </a>
                  </span>
                )}
                {candidate.github && (
                  <span className="contact-item">
                    💻{" "}
                    <a
                      href={`https://${candidate.github}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {candidate.github}
                    </a>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Technical Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <div className="profile-card">
              <h3 className="card-heading">Technical Skills</h3>
              <div className="skills-badge-list">
                {candidate.skills.map((skill, i) => (
                  <span key={i} className="profile-skill-badge">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Featured Projects */}
          {candidate.projects && candidate.projects.length > 0 && (
            <div className="profile-card">
              <h3 className="card-heading">Featured Projects</h3>
              <div className="projects-grid">
                {candidate.projects.map((proj, i) => (
                  <div key={i} className="project-card">
                    <h4 className="project-card-title">{proj.title}</h4>
                    <p className="project-card-desc">{proj.description}</p>
                    {proj.skills_used && proj.skills_used.length > 0 && (
                      <div className="project-skills">
                        {proj.skills_used.map((s, idx) => (
                          <span key={idx} className="project-tag">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {candidate.experiences && candidate.experiences.length > 0 && (
            <div className="profile-card">
              <h3 className="card-heading">Experience & Roles</h3>
              <div className="experience-timeline">
                {candidate.experiences.map((exp, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h4 className="timeline-role">{exp.role}</h4>
                        {exp.duration && (
                          <span className="timeline-duration">{exp.duration}</span>
                        )}
                      </div>
                      <p className="timeline-company">{exp.company}</p>
                      {exp.description && (
                        <p className="timeline-desc">{exp.description}</p>
                      )}
                      {exp.skills_used && exp.skills_used.length > 0 && (
                        <div className="timeline-skills">
                          {exp.skills_used.map((s, idx) => (
                            <span key={idx} className="project-tag">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {candidate.education && candidate.education.length > 0 && (
            <div className="profile-card">
              <h3 className="card-heading">Education</h3>
              <div className="education-list">
                {candidate.education.map((edu, i) => (
                  <div key={i} className="education-item">
                    <div className="edu-main">
                      <h4 className="edu-degree">
                        {edu.degree}{" "}
                        {edu.field_of_study ? `in ${edu.field_of_study}` : ""}
                      </h4>
                      <p className="edu-inst">{edu.institution}</p>
                    </div>
                    <div className="edu-meta">
                      {edu.gpa && <span className="edu-gpa">CPI/GPA: {edu.gpa}</span>}
                      {(edu.start_date || edu.end_date) && (
                        <span className="edu-dates">
                          {edu.start_date || ""} - {edu.end_date || ""}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
