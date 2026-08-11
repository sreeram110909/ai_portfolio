import io
import groq
from fastapi import FastAPI, File, HTTPException, UploadFile, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .config import client, model
from .models import (
    Resume,
    JobDescription,
    MatchResult,
    UserSignUpRequest,
    UserSignInRequest,
    AuthResponse,
    UserResponse,
)
from .parsers import resume_parser, jd_parser
from .matcher import calculate_match, explain_match
from .reader import read_pdf, read_resume
from .database import get_user_by_email, create_user
from .auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    require_current_user,
)


class ResumeParseResponse(BaseModel):
    resume: Resume


class JDRequest(BaseModel):
    job_description: str


class JDParseResponse(BaseModel):
    job_description: JobDescription


class MatchRequest(BaseModel):
    resume: Resume
    job_description: JobDescription


class MatchResponse(BaseModel):
    match: MatchResult
    analysis: str


class ChatRequest(BaseModel):
    question: str
    resume: Resume
    job_description: JobDescription | None = None
    match_result: MatchResult | None = None


class ChatResponse(BaseModel):
    answer: str


app = FastAPI(
    title="AI Portfolio Recruiter API",
    description="Backend API for AI Portfolio and Recruiter Assistant",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/auth/signup", response_model=AuthResponse)
def sign_up(request: UserSignUpRequest):
    """Registers a new user and returns an access token."""
    email = request.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid email address.",
        )

    if len(request.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long.",
        )

    existing = get_user_by_email(email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    hashed_pw = hash_password(request.password)
    user = create_user(email=email, hashed_password=hashed_pw, name=request.name)
    token = create_access_token(user_id=user["id"], email=user["email"])
    return {"token": token, "user": user}


@app.post("/auth/signin", response_model=AuthResponse)
def sign_in(request: UserSignInRequest):
    """Authenticates an existing user and returns an access token."""
    email = request.email.strip().lower()
    user_record = get_user_by_email(email)

    if not user_record or not verify_password(request.password, user_record["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please try again.",
        )

    token = create_access_token(user_id=user_record["id"], email=user_record["email"])
    user = {
        "id": user_record["id"],
        "email": user_record["email"],
        "name": user_record.get("name") or user_record["email"].split("@")[0],
    }
    return {"token": token, "user": user}


@app.get("/auth/me")
def get_current_user_profile(user: dict = Depends(require_current_user)):
    """Returns the currently authenticated user's profile."""
    return {"user": user}


# Cached candidate profile loaded from default resume/resume.pdf
_default_candidate_resume: Resume | None = None


def get_default_resume() -> Resume:
    global _default_candidate_resume
    if _default_candidate_resume is not None:
        return _default_candidate_resume

    from pathlib import Path
    import json

    cache_path = Path("resume/parsed_candidate.json")
    if not cache_path.exists():
        cache_path = Path(__file__).parent.parent / "resume" / "parsed_candidate.json"

    if cache_path.exists():
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                _default_candidate_resume = Resume(**data)
                return _default_candidate_resume
        except Exception:
            pass

    try:
        resume_text = read_resume("resume/resume.pdf")
        _default_candidate_resume = resume_parser(resume_text)
    except Exception as e:
        if cache_path.exists():
            with open(cache_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                _default_candidate_resume = Resume(**data)
        else:
            raise e

    return _default_candidate_resume


@app.get("/")
def root():
    """Root endpoint to check API status."""
    return {"message": "AI Portfolio Recruiter API is running"}


@app.get("/health")
def health_check():
    """Health check endpoint returning the server status."""
    return {"status": "ok"}


@app.get("/profile", response_model=ResumeParseResponse)
def get_candidate_profile():
    """
    Returns the parsed profile of the preconfigured candidate (Chinnu).
    """
    try:
        resume = get_default_resume()
        return {"resume": resume}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load candidate profile: {str(e)}",
        )


@app.post("/resume/parse", response_model=ResumeParseResponse)
async def parse_resume(file: UploadFile = File(...)):
    """
    Parses an uploaded resume PDF and returns structured candidate information.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a PDF file.",
        )

    try:
        content = await file.read()
        if not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty.",
            )

        extracted_text = read_pdf(io.BytesIO(content))
        if not extracted_text or not extracted_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract any text from the uploaded PDF. Please verify the file is not scanned or empty.",
            )

        parsed_resume = resume_parser(extracted_text)
        return {"resume": parsed_resume}
    except groq.RateLimitError:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again shortly.",
        )
    except groq.APIError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service error: {getattr(e, 'message', str(e))}",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse resume: {str(e)}",
        )


@app.post("/job/parse", response_model=JDParseResponse)
def parse_job_description(request: JDRequest):
    """
    Parses a raw job description text and returns structured role requirements.
    """
    if not request.job_description or not request.job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description text cannot be empty.",
        )

    try:
        parsed_jd = jd_parser(request.job_description)
        return {"job_description": parsed_jd}
    except groq.RateLimitError:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again shortly.",
        )
    except groq.APIError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service error: {getattr(e, 'message', str(e))}",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse job description: {str(e)}",
        )


@app.post("/match", response_model=MatchResponse)
def match_resume_to_jd(request: MatchRequest):
    """
    Evaluates candidate resume against job description using deterministic scoring
    and generates an LLM explanation of candidate suitability.
    """
    try:
        match_result = calculate_match(request.resume, request.job_description)
        analysis = explain_match(request.resume, request.job_description, match_result)
        return {
            "match": match_result,
            "analysis": analysis,
        }
    except groq.RateLimitError:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again shortly.",
        )
    except groq.APIError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service error: {getattr(e, 'message', str(e))}",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to evaluate match: {str(e)}",
        )


@app.post("/chat", response_model=ChatResponse)
def recruiter_chat(request: ChatRequest):
    """
    Handles recruiter questions against candidate resume, active job description,
    and match results using an isolated, fresh LLM context.
    """
    if not request.question or not request.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty.",
        )

    try:
        candidate_info = request.resume.model_dump_json(indent=2)

        current_context = ""

        if request.job_description is not None:
            match_res = request.match_result

            jd_dump = request.job_description.model_dump_json(indent=2)
            match_dump = (
                match_res.model_dump_json(indent=2)
                if match_res is not None
                else "No match result available"
            )
            current_context = f"""
            CURRENT JOB DESCRIPTION:
            {jd_dump}

            CURRENT MATCH RESULT:
            {match_dump}
            """

        system_prompt = f"""
        You are an AI assistant representing Banoth Sree Ram Nayak, whose verified resume is provided below.

        CANDIDATE INFORMATION:
        {candidate_info}

        {current_context}

        RULES & INSTRUCTIONS:
        1. Answer ONLY the recruiter's latest message directly, concisely, and professionally.
        2. Ground all factual statements strictly in the candidate information provided. Never invent skills, experience, or qualifications.
        3. If asked about a specific factual detail not in the resume (such as unmentioned personal details), state: "I don't have that information in Chinnu's portfolio."
        4. ROLE SUITABILITY & JOB MATCH EVALUATION:
           - When the recruiter shares a job description or asks whether Chinnu is a match/fit for a role:
             a. Provide an explicit assessment of overall fit (e.g. "Strong Match", "Partial Match", or "Not an Immediate Fit / Notable Gaps").
             b. Clearly highlight **Matching Areas & Strengths** (skills, relevant projects, databases, REST APIs, or foundational coursework that directly align).
             c. Clearly highlight **Key Gaps & Missing Requirements** (specific required technologies like Java, Ruby on Rails, .NET, Spring MVC, or years of experience that are not in the resume).
             d. Give an honest summary recommendation on candidate suitability (e.g., whether core strengths in C++, Python, SQL, and CS fundamentals provide transferable value or if deep domain experience in missing stacks is needed).
        5. If a calculated MATCH RESULT is present in the context, use its calculated score and details without altering or inventing scores.
        6. Clearly distinguish between factual claims from the resume and reasoned suitability assessments.
        7. Keep answers well-structured and focused on what the recruiter is asking.
        """

        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.question.strip()},
            ],
            temperature=0,
        )

        answer = response.choices[0].message.content or ""
        return {"answer": answer}

    except groq.RateLimitError:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again shortly.",
        )
    except groq.APIError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service error: {getattr(e, 'message', str(e))}",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat processing failed: {str(e)}",
        )
