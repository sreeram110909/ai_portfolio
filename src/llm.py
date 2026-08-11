import json

from .config import client, model


def llm_eval(system_prompt: str, user_prompt: str) -> dict:
    """Calls the LLM with JSON mode enabled and parses the JSON response."""
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    response = client.chat.completions.create(
        model=model,
        messages=messages,
        response_format={"type": "json_object"},
        temperature=0,
    )

    answer = response.choices[0].message.content
    return json.loads(answer)


# Alias for backward compatibility
llm_evl = llm_eval
