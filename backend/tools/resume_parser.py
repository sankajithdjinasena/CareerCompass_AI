import json
import re
from pathlib import Path

import pdfplumber
from shared_store.groq_client import call_groq_with_retry

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
        # Support TXT resumes directly
        if path.suffix.lower() == ".txt":
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read().strip()
        raise ValueError(f"Expected a PDF or TXT file, got: {path.suffix}")

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


def _extract_json(text: str) -> dict:
    if not text:
        return {}
    text = text.strip()
    if "<think>" in text and "</think>" not in text:
        raise ValueError("Response was truncated inside the <think> block. No JSON was generated.")
    if "</think>" in text:
        text = text.split("</think>")[-1].strip()
    try:
        start_idx = -1
        for i, char in enumerate(text):
            if char in ['{', '[']:
                start_idx = i
                break
        if start_idx == -1:
            raise ValueError("No JSON object or array found.")
        is_array = text[start_idx] == '['
        open_char = '[' if is_array else '{'
        close_char = ']' if is_array else '}'
        count = 0
        end_idx = -1
        for i in range(start_idx, len(text)):
            if text[i] == open_char:
                count += 1
            elif text[i] == close_char:
                count -= 1
                if count == 0:
                    end_idx = i
                    break
        if end_idx != -1:
            return json.loads(text[start_idx:end_idx+1])
        else:
            raise ValueError("Mismatched brackets in JSON.")
    except Exception as e:
        raise ValueError(f"JSON Parsing Error: {e}\nRaw Text: {text}")


def structure_resume_text(raw_text: str) -> dict:
    """Send raw resume text to Groq and parse the structured JSON response."""
    content = call_groq_with_retry(
        prompt=raw_text,
        system_prompt=SCHEMA_INSTRUCTIONS,
        temperature=0.1,
        max_retries=3
    )
    return _extract_json(content)


def parse_resume(file_path: str) -> dict:
    """
    Full pipeline: PDF/TXT -> raw text -> structured profile JSON.
    This is the function other agents/endpoints should call.
    """
    raw_text = extract_text_from_pdf(file_path)
    structured = structure_resume_text(raw_text)
    structured["_raw_text_length"] = len(raw_text)
    return structured
