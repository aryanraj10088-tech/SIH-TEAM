import os
from groq import Groq

key = os.getenv('GROQ_API_KEY')
client = Groq(api_key=key)
response = client.chat.completions.create(
    model='openai/gpt-oss-20b',
    messages=[
        {'role': 'system', 'content': 'Return ONLY valid JSON with a single object.'},
        {'role': 'user', 'content': 'Return JSON: {"headline":"Test","key_points":["A"],"action_items":["B"],"citations":[]}'},
    ],
    temperature=0.2,
)
print(response.choices[0].message.content)
