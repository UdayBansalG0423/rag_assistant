import requests

OLLAMA_URL = "http://localhost:11434/api/generate"

def generate_response(prompt: str):
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": "llama3:8b",
            "prompt": prompt,
            "stream": False
        }
    )

    if response.status_code != 200:
        raise Exception(f"Ollama Error: {response.text}")

    return response.json()["response"]
