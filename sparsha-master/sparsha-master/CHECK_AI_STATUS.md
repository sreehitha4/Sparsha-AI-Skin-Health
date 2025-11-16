# Checking if AI is Working

## How to Verify AI is Being Used

### 1. Check Backend Console Logs

When you submit a request, look for these messages in your backend console:

**✅ AI is Working:**
```
[AI Agent] Processing request for:
  Skin Type: oily
  Occupation: construction worker
  Weather: {'temperature': 35, ...}
[AI Agent] Response received (first 300 chars): ...
```

**❌ AI is NOT Working (Using Fallback):**
```
[AI Agent] ⚠️ WARNING: OpenAI API key not set! Using fallback recommendations.
[AI Agent] To get AI-powered personalized recommendations, set OPENAI_API_KEY in .env file
```

### 2. Check Response Format

**AI Response Format:**
- Long, detailed text
- Contains specific reasoning ("because...", "due to...")
- Mentions specific ingredients (salicylic acid, niacinamide, etc.)
- Explains why each product is chosen

**Fallback Response Format:**
- Structured with "Daily Routine", "Morning", "Evening" sections
- Generic product names
- Less detailed reasoning
- Contains note: "AI recommendations unavailable"

### 3. Fix Connection Error

The error `ECONNREFUSED` means the backend isn't running.

**To fix:**
1. Open a terminal
2. Navigate to: `cd C:\Users\Navya\crisisspot\crisisspot`
3. Start backend: `uvicorn main:app --reload`
4. You should see: `INFO: Uvicorn running on http://127.0.0.1:8000`

### 4. Set Up OpenAI API Key

1. Create `.env` file in `crisisspot` directory:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

2. Get API key from: https://platform.openai.com/api-keys

3. Restart backend after adding key

### 5. Test AI is Working

Try these combinations and check if you get DIFFERENT products:

**Test 1:** Oily skin + Hot weather (35°C) + Construction worker
**Test 2:** Oily skin + Cold weather (5°C) + Office worker

If AI is working, you should see:
- Different specific products
- Different ingredients mentioned
- Different SPF levels
- Detailed reasoning for each

If you see the same products, AI is not being used (check API key).

