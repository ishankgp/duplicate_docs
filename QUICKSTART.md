# Quick Start Guide

Get the Duplicate Document Detection system running in 5 minutes!

## 1. Install Dependencies

### Backend (Python)
```bash
cd backend
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

### Option A: Two Terminals (Recommended for Development)

**Terminal 1 - Backend:**
```bash
# Windows
start_backend.bat

# Linux/Mac
chmod +x start_backend.sh
./start_backend.sh
```

**Terminal 2 - Frontend:**
```bash
# Windows
start_frontend.bat

# Linux/Mac  
chmod +x start_frontend.sh
./start_frontend.sh
```

### Option B: Command Line

**Windows:**
```bash
# Terminal 1
cd backend && python main.py

# Terminal 2
cd frontend && npm run dev
```

**Linux/Mac:**
```bash
# Terminal 1
cd backend && python main.py

# Terminal 2
cd frontend && npm run dev
```

## 3. Open the App

Open your browser and navigate to:
```
http://localhost:3000
```

## 4. Run Your First Analysis

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

