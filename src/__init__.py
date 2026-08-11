"""
AI Portfolio Package.
"""

from .config import GROQ_API_KEY, MODEL, client, model
from .models import (
    Experience,
    Education,
    Project,
    Certification,
    Resume,
    JobDescription,
    MatchResult,
    resume_schema,
    jd_schema,
)
from .reader import read_pdf, read_resume
from .llm import llm_eval, llm_evl
from .parsers import resume_parser, jd_parser
from .matcher import (
    SKILL_ALIASES,
    normalize_skill,
    get_candidate_skills,
    calculate_match,
    explain_match,
)
from .chat import get_user_input, chatwith_resume
from .api import app

__all__ = [
    "app",
    "GROQ_API_KEY",
    "MODEL",
    "client",
    "model",
    "Experience",
    "Education",
    "Project",
    "Certification",
    "Resume",
    "JobDescription",
    "MatchResult",
    "resume_schema",
    "jd_schema",
    "read_pdf",
    "read_resume",
    "llm_eval",
    "llm_evl",
    "resume_parser",
    "jd_parser",
    "SKILL_ALIASES",
    "normalize_skill",
    "get_candidate_skills",
    "calculate_match",
    "explain_match",
    "get_user_input",
    "chatwith_resume",
]
