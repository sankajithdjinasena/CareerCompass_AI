"""
agents/profile_analysis_agent.py

Wraps tools.resume_parser to produce a validated structured candidate profile.
This is the first agent in the pipeline: Orchestrator -> ProfileAnalysisAgent -> profile JSON.
"""

from typing import Any, Dict

from pydantic import BaseModel, ValidationError, field_validator

from tools.resume_parser import parse_resume


class EducationEntry(BaseModel):
    institution: str | None = None
    degree: str | None = None
    field: str | None = None
    start_year: str | None = None
    end_year: str | None = None


class ExperienceEntry(BaseModel):
    title: str | None = None
    organization: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    description: str = ""


class ProjectEntry(BaseModel):
    name: str | None = None
    description: str = ""
    technologies: list[str] = []


class CandidateProfile(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    skills: list[str] = []
    education: list[EducationEntry] = []
    experience: list[ExperienceEntry] = []
    projects: list[ProjectEntry] = []

    @field_validator("skills")
    @classmethod
    def dedupe_skills(cls, v: list[str]) -> list[str]:
        seen = set()
        deduped = []
        for skill in v:
            key = skill.strip().lower()
            if key and key not in seen:
                seen.add(key)
                deduped.append(skill.strip())
        return deduped


class ProfileAnalysisAgent:
    """
    Parses a resume PDF into a validated CandidateProfile.
    Raises ValueError on malformed input or schema-validation failure,
    so the Orchestrator can catch and retry/flag rather than silently continue.
    """

    def run(self, resume_path: str) -> Dict[str, Any]:
        raw_structured = parse_resume(resume_path)

        # Drop internal metadata field before validation
        raw_structured.pop("_raw_text_length", None)

        try:
            profile = CandidateProfile(**raw_structured)
        except ValidationError as e:
            raise ValueError(
                f"Structured resume output failed schema validation: {e}"
            )

        return profile.model_dump()


if __name__ == "__main__":
    import json
    import sys

    if len(sys.argv) != 2:
        print("Usage: python -m agents.profile_analysis_agent <path_to_resume.pdf>")
        sys.exit(1)

    agent = ProfileAnalysisAgent()
    result = agent.run(sys.argv[1])
    print(json.dumps(result, indent=2))
