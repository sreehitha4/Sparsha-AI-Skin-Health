from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

from models.skin_detector import SkinTypeDetector
from services.weather_service import WeatherService
from services.skincare_agent import SkincareAgent

load_dotenv()

app = FastAPI(title="Sparsha - Skin Care AI", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
skin_detector = SkinTypeDetector()
weather_service = WeatherService()
skincare_agent = SkincareAgent()

class UserInfo(BaseModel):
    occupation: str
    location: str
    age: Optional[int] = None

@app.get("/")
def read_root():
    return {"message": "Sparsha API - Skin Care AI Assistant"}

@app.post("/api/analyze-skin")
async def analyze_skin(
    file: UploadFile = File(...),
    occupation: str = Form(...),
    location: str = Form(...),
    age: Optional[int] = Form(None)
):
    """
    Analyze skin type from uploaded image and generate personalized recommendations
    """
    try:
        # Save uploaded file temporarily
        contents = await file.read()
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as f:
            f.write(contents)
        
        # Detect skin type
        skin_type = skin_detector.detect_skin_type(temp_path)
        
        # Get weather data
        weather_data = None
        if location:
            print(f"[API] Received location: {location}")
            weather_data = weather_service.get_weather(location.strip())
            print(f"[API] Weather data retrieved: {weather_data}")
        else:
            print("[API] No location provided")
        
        # Generate skincare recommendations using CrewAI
        user_info = {
            "skin_type": skin_type,
            "occupation": occupation,
            "location": location,
            "age": int(age) if age else None,
            "weather": weather_data
        }
        
        recommendations = await skincare_agent.get_recommendations(user_info)
        
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        return {
            "skin_type": skin_type,
            "weather_data": weather_data,
            "recommendations": recommendations
        }
    
    except Exception as e:
        # Clean up temp file on error
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*50)
    print("🚀 Starting Sparsha Backend Server")
    print("="*50)
    print("📍 Server will run on: http://127.0.0.1:8000")
    print("📚 API docs available at: http://127.0.0.1:8000/docs")
    
    # Check if OpenAI API key is set
    if not os.getenv("OPENAI_API_KEY"):
        print("\n⚠️  WARNING: OPENAI_API_KEY not found in environment!")
        print("   AI-powered recommendations will not be available.")
        print("   Set OPENAI_API_KEY in .env file to enable AI features.")
    else:
        print("\n✅ OpenAI API key found - AI features enabled")
    
    print("="*50 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
