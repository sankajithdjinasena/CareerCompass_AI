import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

def get_groq_client() -> Groq:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY not set. Check your .env file.")
    return Groq(api_key=api_key)

def get_model() -> str:
    return os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
