import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is missing. Please set it in your .env file.")

client = Groq(api_key=GROQ_API_KEY)

MODEL = "openai/gpt-oss-20b"
model = MODEL

