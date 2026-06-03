# HealthScan

AI-powered web application that helps users understand medical blood test reports in simple language.

> **Disclaimer:** This analysis is for educational purposes only and should not be considered medical advice. Please consult a qualified healthcare professional.

## Features

### Core (MVP)
- Upload blood test reports (PDF, PNG, JPG, JPEG)
- Extract text via PDF parsing (pdfplumber / PyMuPDF) or OCR (Tesseract)
- Structure medical parameters using Gemini AI
- Detect normal, high, and low values against reference ranges

### V3 — Health Priority Engine
- **Concise dashboard** — 6 focused sections, ~70% less content
- **Health Priority Engine** — top 3 ranked priorities with impact levels
- **Health Score** — large gauge with bullet reasons
- **Key Insights** — max 5 calculation-based observations
- **Next Steps** — this week / this month actions
- **Doctor Questions** — 3–5 clean cards
- **Health Coach chat** — detailed analysis on demand
- **Trend-ready schema** — `parameter_trends`, `health_score_history`

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Tailwind CSS, Axios, Vite |
| Backend | Python, FastAPI |
| AI | Google Gemini API |
| PDF | pdfplumber, PyMuPDF |
| OCR | pytesseract, Tesseract OCR |
| Database | MongoDB |

## Project Structure

```
HealthScan/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── config.py            # Environment settings
│   │   ├── routes/              # API endpoints
│   │   ├── services/            # Business logic
│   │   └── utils/               # Helpers
│   ├── uploads/                 # Uploaded files
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # UI components
│   │   ├── pages/               # Upload & Dashboard pages
│   │   └── services/            # API client
│   ├── package.json
│   └── .env.example
└── README.md
```

## Prerequisites

- **Python 3.10–3.14** (3.11 or 3.12 recommended for fastest installs)
- **Node.js 18+**
- **MongoDB** (local or Atlas)
- **Tesseract OCR** installed on your system
- **Google Gemini API key** ([Get one here](https://aistudio.google.com/apikey))

### Install Tesseract OCR

**Windows:**
```powershell
# Using winget
winget install UB-Mannheim.TesseractOCR

# Or download from: https://github.com/UB-Mannheim/tesseract/wiki
```

**macOS:**
```bash
brew install tesseract
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install tesseract-ocr
```

## Setup

### 1. Clone and configure environment

```bash
cd HealthScan
```

**Backend environment:**
```bash
cd backend
copy .env.example .env        # Windows
# cp .env.example .env        # macOS/Linux
```

Edit `backend/.env`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=healthscan
UPLOAD_DIR=uploads
CORS_ORIGINS=http://localhost:5173
```

**Frontend environment:**
```bash
cd ../frontend
copy .env.example .env        # Windows
# cp .env.example .env        # macOS/Linux
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
```

### 2. Start MongoDB

Make sure MongoDB is running locally, or update `MONGODB_URI` to your Atlas connection string.

```bash
# Windows (if installed as service, it may already be running)
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 3. Install and run the backend

```bash
cd backend
python -m venv venv

# Activate virtual environment
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
API docs: `http://localhost:8000/docs`

### 4. Install and run the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload a medical report file |
| POST | `/analyze` | Generate AI analysis for a report |
| POST | `/chat` | Ask questions about a report |
| GET | `/report/{id}` | Fetch report data by ID |
| GET | `/health` | Health check |

## Usage

1. Open `http://localhost:5173`
2. Drag and drop (or click to browse) your blood test report
3. Wait for upload, text extraction, and AI analysis
4. Review the dashboard: summary, parameters table, explanations
5. Use the chat assistant to ask questions about your report

## Troubleshooting

**Tesseract not found:**
- Windows: Add Tesseract install directory to your PATH (e.g., `C:\Program Files\Tesseract-OCR`)
- Or set the path in code: `pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'`

**MongoDB connection error:**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`

**Gemini API errors:**
- Verify your `GEMINI_API_KEY` is valid
- Check API quota at [Google AI Studio](https://aistudio.google.com/)

**CORS errors:**
- Ensure `CORS_ORIGINS` in backend `.env` includes your frontend URL

## License

This project is for educational purposes.
