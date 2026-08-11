import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Chat from "./components/Chat";
import Profile from "./components/Profile";
import JobAnalysis from "./components/JobAnalysis";
import SettingsModal from "./components/SettingsModal";
import {
  getCandidateProfile,
  chatWithCandidate,
  getErrorMessage,
} from "./api/client";
import "./App.css";

const SESSIONS_STORAGE_KEY = "chinnu_ai_chat_sessions";
const THEME_STORAGE_KEY = "chinnu_ai_theme";

export default function App() {
  // Navigation: "chat" | "profile" | "job"
  const [activeView, setActiveView] = useState("chat");

  // Preconfigured candidate profile
  const [candidate, setCandidate] = useState(null);
  const [candidateLoading, setCandidateLoading] = useState(true);

  // Active Job Description & Match Result Context
  const [currentJobDescription, setCurrentJobDescription] = useState(null);
  const [currentMatchResult, setCurrentMatchResult] = useState(null);
  const [analysisText, setAnalysisText] = useState(null);

  // Chat sessions state
  const [chatSessions, setChatSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load sessions from storage:", e);
    }
    const initialId = Date.now().toString();
    return [{ id: initialId, title: "New Conversation", messages: [] }];
  });

  const [currentSessionId, setCurrentSessionId] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed[0].id;
      }
    } catch (e) {}
    return chatSessions[0]?.id || Date.now().toString();
  });

  // UI state
  const [chatLoading, setChatLoading] = useState(false);
  const [chatLoadingStatus, setChatLoadingStatus] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Theme
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_STORAGE_KEY) || "light";
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Persist chat sessions
  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(chatSessions));
    } catch (e) {
      console.error("Failed to save sessions:", e);
    }
  }, [chatSessions]);

  // Load candidate profile on mount
  useEffect(() => {
    async function loadCandidate() {
      try {
        setCandidateLoading(true);
        const data = await getCandidateProfile();
        setCandidate(data.resume);
      } catch (err) {
        console.error("Failed to load candidate profile:", err);
      } finally {
        setCandidateLoading(false);
      }
    }
    loadCandidate();
  }, []);

  // Get current active session
  const currentSession =
    chatSessions.find((s) => s.id === currentSessionId) || chatSessions[0];
  const messages = currentSession ? currentSession.messages : [];

  // Create a new chat session
  function handleNewChat() {
    const newId = Date.now().toString();
    const newSession = {
      id: newId,
      title: "New Conversation",
      messages: [],
    };
    setChatSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setActiveView("chat");
    setIsMobileSidebarOpen(false);
  }

  // Switch session
  function handleSelectSession(sessionId) {
    setCurrentSessionId(sessionId);
    setActiveView("chat");
  }

  // Delete session
  function handleDeleteSession(sessionId) {
    setChatSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const freshId = Date.now().toString();
        const fresh = [{ id: freshId, title: "New Conversation", messages: [] }];
        setCurrentSessionId(freshId);
        return fresh;
      }
      if (sessionId === currentSessionId) {
        setCurrentSessionId(filtered[0].id);
      }
      return filtered;
    });
  }

  // Clear all history
  function handleClearAllHistory() {
    const freshId = Date.now().toString();
    const fresh = [{ id: freshId, title: "New Conversation", messages: [] }];
    setChatSessions(fresh);
    setCurrentSessionId(freshId);
  }

  // Clear Job context
  function handleClearJobContext() {
    setCurrentJobDescription(null);
    setCurrentMatchResult(null);
    setAnalysisText(null);
  }

  // Send message
  async function handleSendMessage(questionText) {
    if (!questionText.trim() || chatLoading) return;

    const userMessage = { role: "recruiter", content: questionText.trim() };

    // Update session messages and title if first question
    setChatSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          const newTitle =
            s.messages.length === 0
              ? questionText.trim().slice(0, 30) + (questionText.length > 30 ? "..." : "")
              : s.title;
          return {
            ...s,
            title: newTitle,
            messages: [...s.messages, userMessage],
          };
        }
        return s;
      })
    );

    setChatLoading(true);
    setChatLoadingStatus("Thinking...");

    try {
      const res = await chatWithCandidate(
        questionText.trim(),
        candidate,
        currentJobDescription,
        currentMatchResult
      );

      const aiMessage = { role: "ai", content: res.answer };

      setChatSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: [...s.messages, aiMessage],
            };
          }
          return s;
        })
      );
    } catch (err) {
      const errorMsg = {
        role: "ai",
        content: `Error: ${getErrorMessage(err)}`,
      };

      setChatSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: [...s.messages, errorMsg],
            };
          }
          return s;
        })
      );
    } finally {
      setChatLoading(false);
      setChatLoadingStatus("");
    }
  }

  // Continue chat after JD matching
  function handleContinueChatFromJob() {
    setActiveView("chat");
  }

  return (
    <div className="app-root">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        chatSessions={chatSessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        currentJobDescription={currentJobDescription}
        currentMatchResult={currentMatchResult}
        onClearJobContext={handleClearJobContext}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main View Area */}
      <main className="app-content">
        {activeView === "chat" && (
          <Chat
            messages={messages}
            onSendMessage={handleSendMessage}
            loading={chatLoading}
            loadingStatus={chatLoadingStatus}
            candidate={candidate}
            currentJobDescription={currentJobDescription}
            currentMatchResult={currentMatchResult}
            onClearJobContext={handleClearJobContext}
            onOpenJobAnalysis={() => setActiveView("job")}
            onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          />
        )}

        {activeView === "profile" && (
          <Profile
            candidate={candidate}
            onStartChat={() => setActiveView("chat")}
            onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          />
        )}

        {activeView === "job" && (
          <JobAnalysis
            candidate={candidate}
            currentJobDescription={currentJobDescription}
            setCurrentJobDescription={setCurrentJobDescription}
            currentMatchResult={currentMatchResult}
            setCurrentMatchResult={setCurrentMatchResult}
            analysisText={analysisText}
            setAnalysisText={setAnalysisText}
            onContinueChat={handleContinueChatFromJob}
            onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        onClearAllHistory={handleClearAllHistory}
      />
    </div>
  );
}
