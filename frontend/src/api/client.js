import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const TOKEN_KEY = "chinnu_ai_auth_token";

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 2 minutes for LLM matching / chat calls
});

// Attach JWT token automatically to all requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Sign up a new user account (with fast 15s timeout).
 */
export async function signUpUser(email, password, name = null) {
  const response = await api.post(
    "/auth/signup",
    { email, password, name },
    { timeout: 20000 }
  );
  if (response.data?.token) {
    localStorage.setItem(TOKEN_KEY, response.data.token);
  }
  return response.data;
}

/**
 * Sign in with existing user credentials (with fast 15s timeout).
 */
export async function signInUser(email, password) {
  const response = await api.post(
    "/auth/signin",
    { email, password },
    { timeout: 20000 }
  );
  if (response.data?.token) {
    localStorage.setItem(TOKEN_KEY, response.data.token);
  }
  return response.data;
}

/**
 * Get current authenticated user profile.
 */
export async function getCurrentUser() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const response = await api.get("/auth/me", { timeout: 15000 });
  return response.data?.user;
}

/**
 * Log out user by clearing stored token.
 */
export function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
}

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
    const detail = error.response.data?.detail;
    if (detail) return detail;
    if (error.response.status === 400)
      return detail || "Invalid request. Please check your inputs.";
    if (error.response.status === 401)
      return "Invalid email or password. If you haven't created an account yet, please click 'Sign up' below.";
    if (error.response.status === 429)
      return "Rate limit exceeded. Please try again shortly.";
    if (error.response.status === 502)
      return "AI service is temporarily unavailable. Please try again.";
    return "An unexpected server error occurred.";
  }
  if (error?.code === "ECONNABORTED") {
    return "Request timed out. The server might be waking up, please try again in a few seconds.";
  }
  if (error?.request) {
    return "Unable to connect to the backend server. Please verify your connection.";
  }
  return error?.message || "An unexpected error occurred.";
}
