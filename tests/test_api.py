from fastapi.testclient import TestClient

from src.api import app


client = TestClient(app)


def test_root():
    response = client.get("/")

    assert response.status_code == 200


def test_health():
    response = client.get("/health")

    assert response.status_code == 200

    assert response.json() == {
        "status": "ok"
    }

def test_resume_parse():
    with open("resume/resume.pdf", "rb") as file:
        response = client.post(
            "/resume/parse",
            files={
                "file": (
                    "resume.pdf",
                    file,
                    "application/pdf"
                )
            }
        )

    assert response.status_code == 200

    data = response.json()

    assert "resume" in data
    assert "name" in data["resume"]
    assert "skills" in data["resume"]

def test_job_parse():
    response = client.post(
        "/job/parse",
        json={
            "job_description": """
            We are looking for a Backend Engineer.

            Required skills:
            Python
            FastAPI
            Docker
            AWS
            REST APIs

            The candidate should have at least 2 years
            of backend development experience.
            """
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert "job_description" in data

    job = data["job_description"]

    assert job["job_title"] == "Backend Engineer"
    assert "python" in [skill.lower() for skill in job["required_skills"]]
    assert "fastapi" in [skill.lower() for skill in job["required_skills"]]
    assert "docker" in [skill.lower() for skill in job["required_skills"]]
    assert "aws" in [skill.lower() for skill in job["required_skills"]]
    assert job["minimum_experience_years"] == 2

def test_match():
    with open("resume/resume.pdf", "rb") as file:
        resume_response = client.post(
            "/resume/parse",
            files={
                "file": (
                    "resume.pdf",
                    file,
                    "application/pdf"
                )
            }
        )

    assert resume_response.status_code == 200

    resume = resume_response.json()["resume"]

    job_response = client.post(
        "/job/parse",
        json={
            "job_description": """
            We are looking for a Backend Engineer.

            Required skills:
            Python
            FastAPI
            Docker
            AWS
            REST APIs

            The candidate should have at least 2 years
            of backend development experience.
            """
        }
    )

    assert job_response.status_code == 200

    job_description = job_response.json()["job_description"]

    response = client.post(
        "/match",
        json={
            "resume": resume,
            "job_description": job_description
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert "match" in data
    assert "analysis" in data

    match = data["match"]

    assert "match_score" in match
    assert "matching_skills" in match
    assert "missing_skills" in match
    assert "relevant_projects" in match

def test_chat():
    with open("resume/resume.pdf", "rb") as file:
        resume_response = client.post(
            "/resume/parse",
            files={
                "file": (
                    "resume.pdf",
                    file,
                    "application/pdf"
                )
            }
        )

    assert resume_response.status_code == 200

    resume = resume_response.json()["resume"]

    job_response = client.post(
        "/job/parse",
        json={
            "job_description": """
            We are looking for a Backend Engineer.

            Required skills:
            Python
            FastAPI
            Docker
            AWS
            REST APIs

            The candidate should have at least 2 years
            of backend development experience.
            """
        }
    )

    assert job_response.status_code == 200

    job_description = job_response.json()["job_description"]

    match_response = client.post(
        "/match",
        json={
            "resume": resume,
            "job_description": job_description
        }
    )

    assert match_response.status_code == 200

    match_result = match_response.json()["match"]

    response = client.post(
        "/chat",
        json={
            "question": "Does the candidate know Python?",
            "resume": resume,
            "job_description": job_description,
            "match_result": match_result
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert "answer" in data
    assert isinstance(data["answer"], str)
    assert len(data["answer"]) > 0