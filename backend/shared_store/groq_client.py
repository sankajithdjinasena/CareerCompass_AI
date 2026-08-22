import os
import time
import logging
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
logger = logging.getLogger(__name__)

def get_groq_client() -> Groq:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY not set. Check your .env file.")
    return Groq(api_key=api_key)

def get_model() -> str:
    return os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

def call_groq_with_retry(prompt: str, system_prompt: str = None, temperature: float = 0.2, max_retries: int = 3) -> str:
    """
    Executes a Groq chat completion request with exponential backoff retries 
    to handle rate-limits (HTTP 429) or transient network issues.
    """
    client = get_groq_client()
    model = get_model()
    
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    delay = 1.0
    for attempt in range(1, max_retries + 1):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.warning(f"Groq API call attempt {attempt}/{max_retries} failed: {e}")
            if attempt == max_retries:
                raise RuntimeError(f"Groq API request failed after {max_retries} attempts: {str(e)}")
            time.sleep(delay)
            delay *= 2.0
