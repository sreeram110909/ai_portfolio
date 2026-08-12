import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 2 minutes — LLM calls can be slow
});

// Automatically retry once if Render cloud backend is cold-starting (waking up)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config || config.__isRetry) {
      return Promise.reject(error);
    }
    // Retry on network errors or 502/503/504 (typical cloud cold-start codes)
    const status = error.response ? error.response.status : null;
    const isColdStart = !status || status === 502 || status === 503 || status === 504;

    if (isColdStart) {
      config.__isRetry = true;
      // Wait 3.5 seconds for container to finish booting
      await new Promise((resolve) => setTimeout(resolve, 3500));
      return api(config);
    }
    return Promise.reject(error);
  }
);

/**
 * Retrieves the candidate profile (Resume object) preconfigured on the backend.
 */
export async function getCandidateProfile() {
  const response = await api.get("/profile");
  return response.data;
}

/**
 * Sends raw job description text and returns structured JobDescription.
 */
export async function parseJobDescription(jobDescriptionText) {
  const response = await api.post("/job/parse", {
    job_description: jobDescriptionText,
  });
  return response.data;
}

/**
 * Sends resume + job description and returns MatchResult + LLM analysis.
 */
export async function calculateMatch(resume, jobDescription) {
  const response = await api.post("/match", {
    resume,
    job_description: jobDescription,
  });
  return response.data;
}

/**
 * Sends a recruiter question with resume context and returns AI answer.
 */
export async function chatWithCandidate(
  question,
  resume,
  jobDescription = null,
  matchResult = null
) {
  const response = await api.post("/chat", {
    question,
    resume,
    job_description: jobDescription,
    match_result: matchResult,
  });
  return response.data;
}

/**
 * Extracts a human-readable error message from an Axios error.
 */
export function getErrorMessage(error) {
  if (error?.response) {
    const data = error.response.data;
    if (data?.detail) {
      if (typeof data.detail === "string") return data.detail;
      if (Array.isArray(data.detail)) {
        return data.detail
          .map((item) => (typeof item === "string" ? item : item.msg || JSON.stringify(item)))
          .join(", ");
      }
      if (typeof data.detail === "object") {
        return data.detail.msg || JSON.stringify(data.detail);
      }
    }
    if (typeof data === "string") return data;
    if (error.response.status === 429)
      return "Rate limit exceeded. Please try again shortly.";
    if (error.response.status === 502 || error.response.status === 503)
      return "The cloud server is warming up. Please try sending your message again in a few seconds.";
    return "An unexpected server error occurred.";
  }
  if (error?.code === "ECONNABORTED") {
    return "Request timed out. The cloud server might be waking up, please try again.";
  }
  if (error?.request) {
    return "The free cloud backend was asleep and is waking up (~30s). Please try sending your message again!";
  }
  return error?.message || "An unexpected error occurred.";
}
