"""
AI Portfolio - Modular Package Facade.
Allows running `python ai_portfolio.py` or importing directly from `ai_portfolio`.
"""

from src import (
    Certification,
    Education,
    Experience,
    JobDescription,
    MatchResult,
    Project,
    Resume,
    calculate_match,
    chatwith_resume,
    client,
    explain_match,
    get_candidate_skills,
    get_user_input,
    jd_parser,
    jd_schema,
    llm_eval,
    llm_evl,
    model,
    normalize_skill,
    read_pdf,
    read_resume,
    resume_parser,
    resume_schema,
)
from main import main

if __name__ == "__main__":
    main()