# Sparsha AI Model

This project contains the official AI model for the Sparsha skin disease detection app.

## 🚀 Final Model: EfficientNet-B4

After 4 experiments, the final, most accurate model has been selected.

* **Model:** `EfficientNet-B4`
* **Peak Validation Accuracy:** **69.34%** (on a 23-class problem)
* **Best Checkpoint:** `sparsha_exp4_B4_epoch_19.pt`

## ⬇️ How to Download the Model

The final model file (`.pt`) is too large for GitHub. You can download it from this secure Google Drive link:

**[https://drive.google.com/file/d/1Sz9_d5XBxvLsjVm1YPLqOeswYW65NoJj/view?usp=sharing](https://drive.google.com/file/d/1Sz9_d5XBxvLsjVm1YPLqOeswYW65NoJj/view?usp=sharing)**

## 🧪 Training Process

The full training process, all experiments, and the final Grad-CAM visualization code are available in the Jupyter Notebook:
* **`Sparsha_Model_Training.ipynb`**
# Sparsha - AI Skin Care Assistant

A beautiful, AI-powered web application that detects your skin type and provides personalized skincare recommendations based on your profile, location, and weather conditions.

## Features

- 🧠 **AI Skin Type Detection**: Uses PyTorch model to detect skin type (oily, dry, normal)
- 🤖 **CrewAI Agent**: Intelligent AI agent that provides personalized skincare recommendations
- 🌤️ **Weather Integration**: Location-based recommendations using weather data
- 💅 **Beautiful UI**: Modern, professional React frontend with Tailwind CSS
- 📸 **Face Upload**: Easy drag-and-drop interface for face photo upload

## Project Structure

```
crisisspot/
├── main.py                 # FastAPI backend server
├── requirements.txt        # Python dependencies
├── models/
│   ├── __init__.py
│   └── skin_detector.py   # PyTorch model integration
├── services/
│   ├── __init__.py
│   ├── weather_service.py # Weather API integration
│   └── skincare_agent.py  # CrewAI agent for recommendations
└── frontend/              # React + Vite + Tailwind frontend
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        └── components/
            ├── Header.jsx
            ├── FaceUpload.jsx
            ├── UserInfoForm.jsx
            ├── LoadingSpinner.jsx
            └── Results.jsx
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Install Python dependencies:**
   ```bash
   cd crisisspot
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   OPENWEATHER_API_KEY=your_openweather_api_key_here  # Optional
   ```

3. **Add your PyTorch model:**
   - Place your trained skin type detection model at `models/skin_type_model.pth`
   - Update `models/skin_detector.py` to load your model correctly
   - The model should output 3 classes: ["dry", "normal", "oily"]

4. **Start the backend server:**
   ```bash
   uvicorn main:app --reload
   ```
   
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:3000`

## Usage

1. **Upload Face Photo**: Drag and drop or browse to upload a clear photo of your face
2. **Enter Information**: Provide your occupation, location, and optional age
3. **Get Recommendations**: Receive personalized skincare recommendations based on:
   - Your detected skin type
   - Your occupation and lifestyle
   - Weather conditions in your location
   - Your age (if provided)

## API Endpoints

### `POST /api/analyze-skin`
Analyzes skin type and generates recommendations.

**Request:**
- `file`: Image file (multipart/form-data)
- `occupation`: String (required)
- `location`: String (required)
- `age`: Integer (optional)

**Response:**
```json
{
  "skin_type": "oily",
  "weather_data": {
    "temperature": 22,
    "humidity": 60,
    "uv_index": 5,
    "condition": "Clear"
  },
  "recommendations": {
    "recommendations": "Personalized skincare plan...",
    "personalized": true
  }
}
```

### `GET /api/health`
Health check endpoint.

## Integrating Your PyTorch Model

To use your trained PyTorch model:

1. **Place your model file** at `models/skin_type_model.pth`

2. **Update `models/skin_detector.py`** in the `_load_model()` method:
   ```python
   def _load_model(self):
       if os.path.exists(self.model_path):
           # Load your model architecture
           self.model = YourModelClass()  # Replace with your model class
           self.model.load_state_dict(torch.load(self.model_path, map_location=self.device))
           self.model.eval()
   ```

3. **Ensure your model:**
   - Takes input of shape `(1, 3, 224, 224)` (RGB image)
   - Outputs logits for 3 classes: [dry, normal, oily]
   - Uses the same preprocessing (normalization) as defined in the code

## API Keys

### OpenAI API Key (Required for CrewAI)
- Get your API key from: https://platform.openai.com/api-keys
- Required for AI-powered personalized recommendations

### OpenWeatherMap API Key (Optional)
- Get free API key from: https://openweathermap.org/api
- If not provided, the app will use mock weather data

## Development

### Backend
- FastAPI with automatic API documentation at `http://localhost:8000/docs`
- CORS enabled for frontend communication

### Frontend
- React 18 with Vite for fast development
- Tailwind CSS for styling
- Responsive design for mobile and desktop

## Troubleshooting

1. **Model not found**: Make sure your PyTorch model is placed at `models/skin_type_model.pth`
2. **API errors**: Check that your API keys are correctly set in `.env`
3. **CORS errors**: Ensure backend is running and CORS middleware is configured
4. **Port conflicts**: Change ports in `vite.config.js` (frontend) or `main.py` (backend)

## License

MIT License

