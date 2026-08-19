from fastapi import FastAPI

app = FastAPI(title="CareerCompass AI")

@app.get("/health")
def health():
    return {"status": "ok"}
