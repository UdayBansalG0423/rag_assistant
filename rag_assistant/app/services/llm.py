import os
import requests
import google.generativeai as genai


LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama")


def generate_response(prompt: str) -> str:
    if LLM_PROVIDER == "gemini":
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

    genai.configure(api_key=api_key)

    model = genai.GenerativeModel("gemini-1.5-flash")

    response = model.generate_content(prompt)

    return response.text
