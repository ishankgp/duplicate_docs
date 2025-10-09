# Quick Start Guide

Get the Duplicate Document Detection system running in 5 minutes!

## 1. Install Dependencies

### Backend (Python)
```bash
cd backend
# Using uv (recommended)
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt

# Or using pip
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate     # Windows
pip install -r requirements.txt

cd ..
```

### Frontend (Node.js)
```bash
cd frontend
npm install
cd ..
```

## 2. Start the Application

### Option A: Using Start Scripts (Recommended)

**Terminal 1 - Backend:**
```bash
# Linux/Mac
chmod +x start_backend.sh
./start_backend.sh

# Windows
start_backend.bat
```

**Terminal 2 - Frontend:**
```bash
# Linux/Mac  
chmod +x start_frontend.sh
./start_frontend.sh

# Windows
start_frontend.bat
```

### Option B: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate     # Windows
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 3. Open the App

The application will automatically choose available ports:

- **Frontend**: Usually http://localhost:3000 (or 3001 if 3000 is busy)
- **Backend**: http://localhost:8000

### For Dev Containers/Codespaces
If you're using GitHub Codespaces or other dev containers, VS Code will automatically forward the ports and show you the URLs in the terminal output.

## 4. Environment Configuration

The system automatically detects your environment (local vs dev container) and configures itself accordingly.

**Optional**: Create a `.env` file in the frontend directory to override settings:
```bash
# Example .env file
VITE_API_BASE_URL=http://localhost:8000
```

## 5. Run Your First Analysis

1. Ensure you have `.docx` files in the `docs/` folder (2 are already there)
2. Click **"Run New Analysis"** in the left panel
3. Wait 10-30 seconds for completion
4. View results in the dashboard!

## 5. Explore Features

- **Dashboard**: See all documents ranked by similarity
- **View Duplicates**: Click to see detailed sentence pairs
- **View Document**: Click to see highlighted content
- **Filters**: Use filters to focus on specific match types

## What's Included

✅ 2 sample documents already in `docs/` folder  
✅ Full backend API (FastAPI)  
✅ Modern React frontend  
✅ Real-time analysis  
✅ Interactive visualizations  
✅ Color-coded highlights  

## Ports

- Backend API: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- API Docs: `http://localhost:8000/docs`

## Troubleshooting

**"Port already in use":**
- Stop other applications using ports 8000 or 3000
- Or change the port numbers in config files

**"Module not found":**
- Run `pip install -r backend/requirements.txt`
- Run `npm install` in frontend folder

**"No documents found":**
- Add `.docx` files to the `docs/` folder
- Run the analysis

## Next Steps

- Read `README_FRONTEND.md` for detailed documentation
- See `TESTING_GUIDE.md` for comprehensive testing
- Check `README_corpus_dedup_runner.md` for analysis details

## Need Help?

1. Check the browser console (F12) for errors
2. Check the backend terminal for Python errors
3. Verify both servers are running
4. Ensure dependencies are installed

Enjoy detecting duplicates! 🎉

