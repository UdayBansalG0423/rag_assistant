from groq import Groq
from app.core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

def generate_response(prompt: str):
    completion = client.chat.completions.create(
        model=settings.MODEL_NAME,
        messages=[
            {"role": "user", "content": prompt}
        ],
    )
    return completion.choices[0].message.content