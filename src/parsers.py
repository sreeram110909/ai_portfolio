from .models import Resume, JobDescription, resume_schema, jd_schema
from .llm import llm_eval


def resume_parser(resume_text: str) -> Resume:
    """Extracts structured resume data from raw resume text using LLM."""
    system_prompt = f"""
    You are a resume information extraction system.

    Extract information from the resume and return a JSON object
    matching the following schema:

    {resume_schema}

    Rules:
    - Extract only information explicitly present in the resume.
    - Never invent information.
    - Use null for missing scalar fields.
    - Use [] for missing list fields.
    - Use YYYY-MM format for dates when possible.
    - Extract all relevant technical and soft skills.
    """

    user_prompt = f"""
    Extract the structured information from this resume:

    --- RESUME START ---
    {resume_text}
    --- RESUME END ---
    """

    parsed_data = llm_eval(system_prompt, user_prompt)
    return Resume(**parsed_data)


def jd_parser(jd_text: str) -> JobDescription:
    """Extracts structured requirements from raw job description text using LLM."""
    system_prompt = f"""
    You are a job description information extraction system.

    Analyze the ENTIRE job description and extract all
    relevant information.

    Return ONLY valid JSON matching this schema:

    {jd_schema}

    Rules:
    1. Extract the job title.
    2. Extract ALL mandatory technical skills, programming languages,
       frameworks, libraries, databases, cloud platforms, tools and technologies
       into required_skills.
    3. Extract nice-to-have, preferred, bonus or desirable skills into preferred_skills.
    4. Extract the minimum years of experience if explicitly mentioned.
    5. Extract education requirements if explicitly mentioned.
    6. Extract the main responsibilities of the role.
    7. Do not invent information.
    8. Do not confuse responsibilities with skills.
    9. Analyze the COMPLETE job description before returning the JSON.
    10. If information is missing, use null or [].
    """

    user_prompt = f"""
    Analyze this complete job description:

    --- JD START ---
    {jd_text}
    --- JD END ---
    """

    parsed_data = llm_eval(system_prompt, user_prompt)
    return JobDescription(**parsed_data)
