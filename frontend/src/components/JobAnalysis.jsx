import React, { useState } from "react";
import MatchResult from "./MatchResult";
import { parseJobDescription, calculateMatch, getErrorMessage } from "../api/client";
import "./JobAnalysis.css";

export default function JobAnalysis({
  candidate,
  currentJobDescription,
  setCurrentJobDescription,
  currentMatchResult,
  setCurrentMatchResult,
  analysisText,
  setAnalysisText,
  onContinueChat,
  onOpenMobileMenu,
}) {
  const [jdInput, setJdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [error, setError] = useState(null);

  const sampleJD = `Role: Senior Backend / AI Engineer
Company: HyperGrowth Labs
Required Skills:
- Python
- FastAPI
- REST APIs
- MySQL or PostgreSQL
- Docker
Preferred Skills:
- PyTorch or Deep Learning
- React
- Linux
Experience: Minimum 1 year required.
Education: Bachelor's degree in Computer Science or AI.
Responsibilities:
- Build low-latency backend APIs and microservices.
- Integrate LLM models and deep learning pipelines.
- Design normalized database schemas and optimize SQL queries.`;

  function handleLoadSample() {
    setJdInput(sampleJD);
    setError(null);
  }

  async function handleAnalyze() {
    if (!jdInput.trim()) {
      setError("Please paste a job description first.");
      return;
    }
    if (!candidate) {
      setError("Candidate profile is still loading. Please try again in a moment.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Step 1: Parse JD
      setLoadingStatus("Reading job description...");
      const jdData = await parseJobDescription(jdInput.trim());
      const parsedJD = jdData.job_description;
      setCurrentJobDescription(parsedJD);

      // Step 2: Calculate Match
      setLoadingStatus("Evaluating candidate against requirements...");
      const matchData = await calculateMatch(candidate, parsedJD);
      setCurrentMatchResult(matchData.match);
      setAnalysisText(matchData.analysis);
      setLoadingStatus("");
    } catch (err) {
      setError(getErrorMessage(err));
      setLoadingStatus("");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setJdInput("");
    setCurrentJobDescription(null);
    setCurrentMatchResult(null);
    setAnalysisText(null);
    setError(null);
  }

  return (
    <div className="job-analysis-container">
      {/* Top bar */}
      <header className="job-analysis-topbar">
        <button className="mobile-menu-btn" onClick={onOpenMobileMenu}>
          ☰
        </button>
        <h2 className="job-analysis-topbar-title">Job Match Evaluation</h2>
      </header>

      {/* Content */}
      <div className="job-analysis-content">
        <div className="job-analysis-inner">
          {/* Input Card */}
          <div className="job-input-card">
            <div className="card-header-row">
              <div>
                <h3 className="card-heading">Paste Job Description</h3>
                <p className="card-subheading">
                  Paste the full job posting to run deterministic matching and LLM suitability evaluation for {candidate?.name || "Chinnu"}.
                </p>
              </div>
              <button className="sample-btn" onClick={handleLoadSample} type="button">
                Load Sample JD
              </button>
            </div>

            <textarea
              className="jd-textarea"
              placeholder="Paste job title, responsibilities, required & preferred skills, experience..."
              value={jdInput}
              onChange={(e) => {
                setJdInput(e.target.value);
                setError(null);
              }}
              rows={9}
              disabled={loading}
              id="job-description-textarea"
            />

            <div className="job-actions-row">
              <button
                className="analyze-submit-btn"
                onClick={handleAnalyze}
                disabled={loading || !jdInput.trim()}
                id="analyze-job-submit-btn"
              >
                {loading ? (
                  <>
                    <span className="spinner-dot" />
                    <span>{loadingStatus || "Analyzing..."}</span>
                  </>
                ) : (
                  <span>Analyze Candidate Match</span>
                )}
              </button>

              {(jdInput || currentMatchResult) && (
                <button
                  className="reset-input-btn"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Clear
                </button>
              )}
            </div>

            {error && <div className="job-error-banner">{error}</div>}
          </div>

          {/* Result Card */}
          {currentMatchResult && (
            <MatchResult
              matchData={currentMatchResult}
              analysis={analysisText}
              parsedJob={currentJobDescription}
              candidate={candidate}
              onContinueChat={onContinueChat}
            />
          )}
        </div>
      </div>
    </div>
  );
}
