"""
api/main.py

FastAPI app exposing the resume upload -> structured profile pipeline.
"""

import shutil
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile

from agents.profile_analysis_agent import ProfileAnalysisAgent

app = FastAPI(title="CareerCompass AI")

profile_agent = ProfileAnalysisAgent()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail=f"Expected a PDF file, got content-type: {file.content_type}",
        )

    # Save the upload to a temp file so pdfplumber can read it from disk
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        profile = profile_agent.run(tmp_path)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")
    finally:
        Path(tmp_path).unlink(missing_ok=True)

    return {"profile": profile}
