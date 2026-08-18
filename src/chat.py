import select
import sys

from .config import client, model
from .matcher import calculate_match, explain_match
from .models import Resume
from .parsers import jd_parser, resume_parser


def get_user_input(prompt: str = "\nRecruiter: ") -> str:
    """Reads single-line or pasted multi-line input from the terminal in one go."""
    print(prompt, end="", flush=True)
    first_line = sys.stdin.readline()
    if not first_line:
        return ""

    lines = [first_line]
    while True:
        readable, _, _ = select.select([sys.stdin], [], [], 0.08)
        if readable:
            line = sys.stdin.readline()
            if not line:
                break
            lines.append(line)
        else:
            break

    return "".join(lines).strip()


def chatwith_resume(resume: Resume | str):
    """Interactive recruiter chatbot interface with independent fresh question calls."""
    if isinstance(resume, Resume):
        candidate_info = resume.model_dump_json(indent=2)
        resume_obj = resume
    else:
        candidate_info = resume
        resume_obj = resume_parser(resume)

    # Current JD and its match result
    current_jd = None
    current_match = None

    print("\n" + "=" * 55)
    print("🤖 AI Portfolio Chatbot Ready!")
    print("You can ask questions, or type '/jd' to evaluate a Job Description.")
    print("Type 'exit' or 'quit' to end the session.")
    print("=" * 55)

    while True:
        user_question = get_user_input("\nRecruiter: ")

        # Ignore empty input
        if not user_question:
            continue

        # Exit
        if user_question.lower() in ["exit", "quit", "bye"]:
            print("\nAI: Thank you for your time! Goodbye.")
            break

        # --------------------------------------------------
        # JOB DESCRIPTION MODE (/jd)
        # --------------------------------------------------
        if user_question.lower().startswith("/jd"):
            rest = user_question[3:].strip()
            if rest:
                jd_text = rest
            else:
                print("\nPaste the complete job description.")
                print("Type END on a new line when finished.\n")
                jd_lines = []
                while True:
                    line = input()
                    if line.strip() == "END":
                        break
                    jd_lines.append(line)
                jd_text = "\n".join(jd_lines).strip()

            if not jd_text:
                print("\nAI: No job description provided.")
                continue

            print("\nAI: Analyzing the job description against Chinnu's resume across skills, experience, and projects...")

            current_jd = jd_parser(jd_text)
            current_match = calculate_match(resume_obj, current_jd)
            analysis = explain_match(resume_obj, current_jd, current_match)

            print("\n" + "=" * 55)
            print(f"📊 MATCH EVALUATION: {current_match.match_score}%")

            if current_jd.job_title:
                print(f"💼 Role: {current_jd.job_title}")

            print("=" * 55)

            print("\nMatching Skills:")
            if current_match.matching_skills:
                for skill in current_match.matching_skills:
                    print(f"  ✓ {skill}")
            else:
                print("  None")

            print("\nMissing / Gap Skills:")
            if current_match.missing_skills:
                for skill in current_match.missing_skills:
                    print(f"  ✗ {skill}")
            else:
                print("  None")

            if current_match.matching_preferred_skills:
                print("\n🌟 Matching Preferred Skills:")
                for skill in current_match.matching_preferred_skills:
                    print(f"  ✓ {skill}")

            if current_match.relevant_experience:
                print("\n💼 Relevant Experience:")
                for experience in current_match.relevant_experience:
                    print(f"  ✓ {experience}")

            if current_match.relevant_projects:
                print("\n🚀 Relevant Projects:")
                for project in current_match.relevant_projects:
                    print(f"  ✓ {project}")

            print("\n🎓 Qualification Checks:")
            if current_jd.minimum_experience_years is not None and current_jd.minimum_experience_years > 0:
                if resume_obj.total_experience_years is None:
                    exp_status = "⚠ Unable to verify required experience from resume"
                elif resume_obj.total_experience_years >= current_jd.minimum_experience_years:
                    exp_status = f"✓ Requirement met ({resume_obj.total_experience_years} yrs vs {current_jd.minimum_experience_years} yrs required)"
                else:
                    exp_status = f"✗ Below requirement ({resume_obj.total_experience_years} yrs vs {current_jd.minimum_experience_years} yrs required)"
            else:
                exp_status = "✓ No minimum experience required"

            edu_status = "✓ Requirement met" if (current_match and getattr(current_match, "education_match", False)) else "• Review required"
            print(f"  • Experience Criteria: {exp_status}")
            print(f"  • Education Criteria:  {edu_status}")

            print("\n📝 Candidate Suitability Analysis:")
            print(analysis)
            print("=" * 55)

            continue

        # --------------------------------------------------
        # FRESH RECRUITER QUESTION FLOW
        # --------------------------------------------------
        current_context = ""
        if current_jd is not None:
            # If current_match is not yet computed, compute it if resume_obj is available
            if current_match is None and resume_obj is not None:
                try:
                    current_match = calculate_match(resume_obj, current_jd)
                except Exception:
                    current_match = None

            jd_str = (
                current_jd.model_dump_json(indent=2)
                if hasattr(current_jd, "model_dump_json")
                else str(current_jd)
            )

            if current_match is not None and hasattr(current_match, "model_dump_json"):
                match_str = current_match.model_dump_json(indent=2)
            elif current_match is not None:
                match_str = str(current_match)
            else:
                match_str = "No match result available"

            current_context = f"""
            CURRENT JOB DESCRIPTION:
            {jd_str}

            CURRENT MATCH RESULT:
            {match_str}
            """

        system_prompt = f"""
        You are an AI assistant representing Banoth Sree Ram Nayak, whose verified resume is provided below.

        CANDIDATE INFORMATION:
        {candidate_info}

        {current_context}

        RULES & INSTRUCTIONS:
        1. Answer ONLY the recruiter's latest message directly, concisely, and professionally.
        2. Ground all factual statements strictly in the candidate information provided. Never invent skills, experience, or qualifications.
        3. If asked about a specific factual detail not in the resume, state: "I don't have that information in Chinnu's portfolio."
        4. ROLE SUITABILITY & JOB MATCH EVALUATION:
           - When the recruiter shares a job description or asks whether Chinnu is a match/fit for a role:
             a. Provide an explicit assessment of overall fit (e.g. "Strong Match", "Partial Match", or "Not an Immediate Fit / Notable Gaps").
             b. Clearly highlight **Matching Areas & Strengths** (skills, relevant projects, databases, REST APIs, or foundational coursework that directly align).
             c. Clearly highlight **Key Gaps & Missing Requirements** (specific required technologies like Java, Ruby on Rails, .NET, Spring MVC, or years of experience that are not in the resume).
             d. Give an honest summary recommendation on candidate suitability (e.g., whether core strengths in C++, Python, SQL, and CS fundamentals provide transferable value or if deep domain experience in missing stacks is needed).
        5. If a calculated MATCH RESULT is present in the context, refer to its calculated score and details without altering or inventing scores.
        6. Clearly distinguish between factual claims from the resume and reasoned suitability assessments.
        7. Keep answers well-structured and focused on what the recruiter is asking.
        8. FORMATTING STYLE FOR LISTS & PROJECTS:
           - Always format lists of projects, work experience, or technical skills as clean, structured bulleted lists with bold headers and bullet points for Description and Skills Used.
           - Avoid raw Markdown tables unless explicitly requested by the recruiter.
        """


        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_question},
            ],
            stream=True,
        )

        answer = ""
        print("\nAI: ", end="")
        for chunk in response:
            content = chunk.choices[0].delta.content
            if content:
                print(content, end="", flush=True)
                answer += content
        print()
