import os
import requests
from google import genai
from dotenv import load_dotenv

load_dotenv()

def generate_response(prompt: str) -> str:
    llm_provider = os.getenv("LLM_PROVIDER", "ollama")
    if llm_provider == "gemini":
        return call_gemini(prompt)
    else:
        return call_ollama(prompt)


def call_ollama(prompt: str) -> str:
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3:8b",
            "prompt": prompt,
            "stream": False
        }
    )

    if response.status_code != 200:
        raise Exception(f"Ollama Error: {response.text}")

    return response.json()["response"]


def call_gemini(prompt: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise Exception("GEMINI_API_KEY not set")

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt
    )

    return response.text
