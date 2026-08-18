# Chinnu AI — AI Recruiter Portfolio Assistant

An intelligent, conversational AI assistant representing **Banoth Sree Ram Nayak (Chinnu)**. Recruiters can interact through a ChatGPT-style interface to explore technical skills, project architectures, work experience, and evaluate candidate-job fit using deterministic matching and LLM suitability analysis.

---

## Architecture Overview

```
                        ┌───────────────────────────────┐
                        │   React + Vite (Frontend)     │
                        │   ChatGPT-style Chat & Match  │
                        └───────────────┬───────────────┘
                                        │ (Axios REST)
                                        ▼
                        ┌───────────────────────────────┐
                        │      FastAPI Backend          │
                        │ (Stateless API & Pydantic DTO)│
                        └───────┬───────────────┬───────┘
                                │               │
                ┌───────────────▼───────┐  ┌────▼──────────────────────┐
                │ Deterministic Matcher │  │ Groq LLM (openai/gpt-oss-20b) │
                │ Skills / Experience   │  │ Context-Grounding Chat &  │
                │ Qualification Rules   │  │ Suitability Explanation   │
                └───────────────────────┘  └───────────────────────────┘
```

---

## Key Features

- **Conversational Candidate Representation**: Recruiters can ask about skills, projects, background, and fit. Responses are strictly grounded in verified resume data.
- **Role Fit & Job Suitability Evaluation**: Real-time evaluation of pasted job descriptions with breakdown of matching skills, missing technologies, and recommendations.
- **Deterministic Match Scoring**: Quantitative matching algorithm calculates exact score percentages, experience alignment, and qualification checks.
- **Preloaded Candidate Profile**: Preconfigured resume parsing ensures zero recruiter upload friction.
- **ChatGPT-Style UI**: Full-screen conversation layout, message history stored in local storage, dark/light themes, and responsive design.

---

## Tech Stack

- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic v2, PyPDF, Groq API (`openai/gpt-oss-20b`)
- **Frontend**: React 19, Vite, Axios, Vanilla CSS (with CSS design tokens and dark mode)
- **Deployment**: Render / Railway (Backend) & Vercel (Frontend)

---

## Project Structure

```text
ai_portfolio/
├── src/
│   ├── api.py            # FastAPI REST endpoints (/profile, /job/parse, /match, /chat)
│   ├── chat.py           # CLI chat loop and system prompt
│   ├── config.py         # Groq client initialization
│   ├── llm.py            # LLM invocation wrapper
│   ├── matcher.py        # Deterministic matching algorithm & explanation generator
│   ├── models.py         # Pydantic schemas (Resume, JobDescription, MatchResult)
│   ├── parsers.py        # Structured resume & JD parsers
│   └── reader.py         # PDF text extraction
├── frontend/
│   ├── src/
│   │   ├── api/client.js # Axios API client
│   │   ├── components/   # Sidebar, Chat, Profile, JobAnalysis, MatchResult
│   │   ├── App.jsx       # State management and navigation
│   │   └── index.css     # Global design system
│   ├── index.html
│   ├── package.json
│   └── vercel.json       # SPA routing configuration
├── resume/
│   ├── resume.pdf        # Verified candidate resume
│   └── parsed_candidate.json # Pre-cached profile
├── tests/
│   └── test_api.py       # Integration tests
├── Procfile              # Cloud process definition
├── pyproject.toml        # Dependencies & packaging
└── requirements.txt      # Cloud build specification
```

---

## Getting Started Locally

### 1. Prerequisites
- Python 3.11+ (or `uv`)
- Node.js 18+ & npm
- A free [Groq API Key](https://console.groq.com/keys)

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/sreeram110909/ai_portfolio.git
cd ai_portfolio

# Set up environment
cp .env.example .env
# Add your GROQ_API_KEY to .env

# Install dependencies and start FastAPI server
uv run uvicorn src.api:app --reload --port 8000
```
Backend will run at `http://127.0.0.1:8000` (Docs at `/docs`).

### 3. Frontend Setup
```bash
cd frontend

# Set up environment
cp .env.example .env

# Install dependencies and start Vite dev server
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/health` | `GET` | Health check probe |
| `/profile` | `GET` | Retrieve preconfigured candidate profile JSON |
| `/job/parse` | `POST` | Extract structured requirements from raw JD text |
| `/match` | `POST` | Calculate deterministic score & LLM suitability analysis |
| `/chat` | `POST` | Grounded chat response against candidate & JD context |

---

## Deployment

### Deploy Backend (Render)
1. Create a **New Web Service** on [Render](https://render.com/).
2. Select this GitHub repo.
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn src.api:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variable: `GROQ_API_KEY=your_key`.

### Deploy Frontend (Vercel)
1. Import the repository into [Vercel](https://vercel.com/).
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable: `VITE_API_URL=https://your-backend.onrender.com`.
4. Deploy!
