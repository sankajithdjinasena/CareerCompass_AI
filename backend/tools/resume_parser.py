import json
import re
from pathlib import Path

import pdfplumber

from shared_store.groq_client import get_groq_client, get_model

SCHEMA_INSTRUCTIONS = """
You are a resume-parsing engine. Given raw resume text, extract structured data
and return ONLY valid JSON (no markdown fences, no commentary) matching this shape:

{
  "name": string or null,
  "email": string or null,
  "phone": string or null,
  "location": string or null,
  "skills": [string],
  "education": [
    {"institution": string, "degree": string, "field": string or null, "start_year": string or null, "end_year": string or null}
  ],
  "experience": [
    {"title": string, "organization": string, "start_date": string or null, "end_date": string or null, "description": string}
  ],
  "projects": [
    {"name": string, "description": string, "technologies": [string]}
  ]
}

Rules:
- If a field is not present in the resume, use null or an empty list — never invent data.
- "skills" should be a flat deduplicated list of technical/soft skills mentioned anywhere.
- Return raw JSON only. Do not wrap it in ```json code fences.
"""


def extract_text_from_pdf(file_path: str) -> str:
    """Extract raw text from a PDF file using pdfplumber."""
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Resume file not found: {file_path}")
    if path.suffix.lower() != ".pdf":
        raise ValueError(f"Expected a PDF file, got: {path.suffix}")

    text_chunks = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_chunks.append(page_text)

    full_text = "\n".join(text_chunks).strip()
    if not full_text:
        raise ValueError(
            "No extractable text found in PDF. It may be a scanned image "
            "without an OCR text layer."
        )
    return full_text


def _strip_code_fences(text: str) -> str:
    """Remove ```json ... ``` wrappers if the model adds them despite instructions."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def structure_resume_text(raw_text: str) -> dict:
    """Send raw resume text to Groq and parse the structured JSON response."""
    client = get_groq_client()
    model = get_model()

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SCHEMA_INSTRUCTIONS},
            {"role": "user", "content": raw_text},
        ],
        temperature=0.1,
    )

    content = response.choices[0].message.content
    cleaned = _strip_code_fences(content)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"Failed to parse structured resume JSON from LLM output: {e}\n"
            f"Raw output was:\n{content}"
        )


def parse_resume(file_path: str) -> dict:
    """
    Full pipeline: PDF -> raw text -> structured profile JSON.
    This is the function other agents/endpoints should call.
    """
    raw_text = extract_text_from_pdf(file_path)
    structured = structure_resume_text(raw_text)
    structured["_raw_text_length"] = len(raw_text)
    return structured


if __name__ == "__main__":
    import sys

    if len(sys.argv) != 2:
        print("Usage: python resume_parser.py <path_to_resume.pdf>")
        sys.exit(1)

    result = parse_resume(sys.argv[1])
    print(json.dumps(result, indent=2))
