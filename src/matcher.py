from .config import client, model
from .models import Resume, JobDescription, MatchResult

SKILL_ALIASES = {
    "node": "node.js",
    "nodejs": "node.js",
    "node.js": "node.js",

    "express": "express.js",
    "expressjs": "express.js",
    "express.js": "express.js",

    "react": "react",
    "reactjs": "react",

    "rest api": "rest apis",
    "restful api": "rest apis",
    "rest apis": "rest apis",
    "restful apis": "rest apis",
    "rest api design": "rest apis",
    "restful api design": "rest apis",
    "rest api development": "rest apis",
    "restful api development": "rest apis",

    "postgres": "postgresql",
    "postgresql": "postgresql",
    "mysql": "mysql",

    "python": "python",
    "fastapi": "fastapi",
    "docker": "docker",
    "aws": "aws",
}


def normalize_skill(skill: str) -> str:
    """Normalizes skill naming variants to a canonical lowercase string."""
    skill = skill.lower().strip()
    return SKILL_ALIASES.get(skill, skill)


def get_candidate_skills(resume: Resume) -> set[str]:
    """Collects and normalizes all skills present across the entire candidate resume."""
    skills = set()

    for skill in resume.skills:
        skills.add(normalize_skill(skill))

    for experience in resume.experiences:
        for skill in experience.skills_used:
            skills.add(normalize_skill(skill))

    for project in resume.projects:
        for skill in project.skills_used:
            skills.add(normalize_skill(skill))

    return skills


def calculate_match(resume: Resume, jd: JobDescription) -> MatchResult:
    """
    Computes a comprehensive deterministic match score across 5 evaluation pillars:
      1. Required skills (50% weight)
      2. Experience criteria & relevance (20% weight)
      3. Relevant projects & skill depth (15% weight)
      4. Preferred skills (10% weight)
      5. Education requirements (5% weight)
    """
    candidate_skills = get_candidate_skills(resume)

    # 1. Required Skills Matching (Weight: 50%)
    required_skills = {normalize_skill(skill) for skill in jd.required_skills}
    matching_skills = candidate_skills.intersection(required_skills)
    missing_skills = required_skills.difference(candidate_skills)

    if required_skills:
        required_skill_score = (len(matching_skills) / len(required_skills)) * 100.0
    else:
        required_skill_score = 100.0

    # 2. Preferred Skills Matching (Weight: 10%)
    preferred_skills = {normalize_skill(skill) for skill in jd.preferred_skills}
    matching_preferred_skills = candidate_skills.intersection(preferred_skills)

    if preferred_skills:
        preferred_skill_score = (len(matching_preferred_skills) / len(preferred_skills)) * 100.0
    else:
        preferred_skill_score = 100.0

    all_target_skills = required_skills.union(preferred_skills)

    # 3. Experience Evaluation (Weight: 20%)
    relevant_experience = []
    for exp in resume.experiences:
        exp_skills = {normalize_skill(s) for s in exp.skills_used}
        matched_in_exp = exp_skills.intersection(all_target_skills)
        desc_lower = (exp.description or "").lower()
        role_lower = (exp.role or "").lower()

        mentions_skill = any(s in desc_lower or s in role_lower for s in all_target_skills) if all_target_skills else False

        if matched_in_exp or mentions_skill:
            skills_str = f" (Skills: {', '.join(sorted(exp.skills_used))})" if exp.skills_used else ""
            duration_str = f" [{exp.duration}]" if exp.duration else ""
            summary = f"{exp.role or 'Role'} at {exp.company or 'Company'}{duration_str}{skills_str}"
            relevant_experience.append(summary)

    candidate_exp_years = resume.total_experience_years

    if jd.minimum_experience_years is not None and jd.minimum_experience_years > 0:
        if candidate_exp_years is None:
            experience_match = False
            exp_duration_score = 40.0 if relevant_experience else 0.0
        elif candidate_exp_years >= jd.minimum_experience_years:
            experience_match = True
            exp_duration_score = 100.0
        else:
            experience_match = False
            exp_duration_score = max(0.0, (candidate_exp_years / jd.minimum_experience_years) * 100.0)
    else:
        experience_match = True
        exp_duration_score = 100.0

    if relevant_experience:
        experience_score = (exp_duration_score * 0.60) + 40.0
    else:
        experience_score = exp_duration_score * 0.60

    # 4. Relevant Projects Matching (Weight: 15% - based on JD requirement coverage)
    relevant_projects = []
    skills_matched_in_projects = set()

    for proj in resume.projects:
        proj_skills = {normalize_skill(s) for s in proj.skills_used}
        matched_in_proj = proj_skills.intersection(all_target_skills)
        desc_lower = (proj.description or "").lower()
        title_lower = (proj.title or "").lower()

        mentions_skill = any(s in desc_lower or s in title_lower for s in all_target_skills) if all_target_skills else False

        if matched_in_proj or mentions_skill:
            skills_matched_in_projects.update(matched_in_proj)
            skills_str = f" (Skills: {', '.join(sorted(proj.skills_used))})" if proj.skills_used else ""
            summary = f"{proj.title or 'Project'}{skills_str}"
            relevant_projects.append(summary)

    if all_target_skills and skills_matched_in_projects:
        project_coverage = len(skills_matched_in_projects) / len(all_target_skills)
        project_score = round(project_coverage * 100.0, 2)
    elif relevant_projects:
        project_score = 30.0
    else:
        project_score = 0.0

    # 5. Education Evaluation (Weight: 5%)
    if not jd.education_requirements:
        education_match = True
        education_score = 100.0
    else:
        candidate_edu_text = " ".join(
            f"{edu.degree or ''} {edu.field_of_study or ''} {edu.institution or ''}".lower()
            for edu in resume.education
        )
        jd_edu_text = " ".join(jd.education_requirements).lower()

        edu_keywords = ["bachelor", "master", "b.tech", "btech", "b.e", "be", "degree", "computer science", "engineering", "information technology"]
        matched_keywords = [kw for kw in edu_keywords if kw in jd_edu_text and kw in candidate_edu_text]

        if matched_keywords or (resume.education and any(edu.degree for edu in resume.education)):
            education_match = True
            education_score = 100.0
        else:
            education_match = False
            education_score = 50.0

    # Comprehensive Overall Weighted Score
    overall_score = (
        (required_skill_score * 0.50)
        + (experience_score * 0.20)
        + (project_score * 0.15)
        + (preferred_skill_score * 0.10)
        + (education_score * 0.05)
    )

    return MatchResult(
        match_score=round(overall_score, 2),
        matching_skills=sorted(matching_skills),
        missing_skills=sorted(missing_skills),
        matching_preferred_skills=sorted(matching_preferred_skills),
        relevant_experience=relevant_experience,
        relevant_projects=relevant_projects,
        experience_match=experience_match,
        education_match=education_match,
    )


def explain_match(resume: Resume, jd: JobDescription, match_result: MatchResult) -> str:
    """Generates a concise, professional LLM explanation of candidate suitability including responsibility alignment."""
    responsibilities_text = ""
    if jd.responsibilities:
        responsibilities_text = "\nJob Key Responsibilities:\n" + "\n".join(f"- {r}" for r in jd.responsibilities)

    prompt = f"""
    You are analyzing a candidate against a job description based on the deterministic match evaluation below.

    Candidate Resume:
    {resume.model_dump_json(indent=2)}

    Job Description:
    {jd.model_dump_json(indent=2)}
    {responsibilities_text}

    Calculated Match Evaluation:
    {match_result.model_dump_json(indent=2)}

    Explain the candidate's suitability for this role.

    Structure your analysis with these sections:
    1. Strongest Matching Areas (matching skills, project implementations, relevant experience)
    2. Key Gaps & Growth Areas (missing skills, experience requirements)
    3. Responsibility Alignment (how candidate's past work and projects align with the role's responsibilities)
    4. Overall Recommendation (concise summary)

    Rules:
    - Do not change or contradict the calculated match score ({match_result.match_score}%).
    - Treat matching_skills as the authoritative direct skill matches.
    - Treat missing_skills as skills that were not explicitly matched in candidate skills list.
    - Do not say the candidate has no related experience merely because a skill is missing; check their actual experiences and projects.
    - Distinguish direct skill matches from related or transferable experience.
    - Mention the strongest matching areas (matching skills, relevant experience, relevant projects).
    - Mention important gaps (missing skills, experience criteria).
    - Do not contradict the MatchResult.
    - Never invent skills or qualifications.
    - Be concise, analytical, and professional.
    """

    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )

    return response.choices[0].message.content
