# Quick Setup Guide

## Step 1: Backend Setup

```bash
# Navigate to project directory
cd crisisspot

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your API keys

# Place your PyTorch model at models/skin_type_model.pth
# (Update models/skin_detector.py to load your model)

# Start backend server
uvicorn main:app --reload
```

## Step 2: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Step 3: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Adding Your PyTorch Model

1. Save your trained model as `models/skin_type_model.pth`
2. Update `models/skin_detector.py`:
   - Replace `_load_model()` method with your model loading code
   - Ensure model outputs 3 classes: ["dry", "normal", "oily"]
   - Model should accept input shape: (1, 3, 224, 224)

## API Keys

- **OpenAI API Key**: Required for CrewAI agent
  - Get from: https://platform.openai.com/api-keys
  - Add to `.env` as `OPENAI_API_KEY=your_key`

- **OpenWeatherMap API Key**: Optional (uses mock data if not provided)
  - Get from: https://openweathermap.org/api
  - Add to `.env` as `OPENWEATHER_API_KEY=your_key`

