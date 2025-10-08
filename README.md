# Duplicate Document Detection System

A modern web application for detecting and visualizing duplicate content across `.docx` documents using React + TypeScript frontend and FastAPI backend.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![Node](https://img.shields.io/badge/node-16+-green.svg)

## Features

- 📊 **Document Dashboard** - View all documents ranked by similarity score
- 🔍 **Three Detection Methods**:
  - **Exact Match** - Identical sentences (red highlights)
  - **Near-Duplicate** - SimHash similarity (orange highlights)
  - **Semantic Match** - Embedding-based meaning (yellow highlights)
- 📄 **Document Viewer** - View documents with color-coded duplicate highlights
- 🔄 **Comparison View** - Side-by-side duplicate sentence pairs
- ⚙️ **Interactive Analysis** - Run analysis with configurable parameters
- 🚀 **Real-time Updates** - Background analysis with status polling

## Quick Start

### Prerequisites

- Python 3.8+ (with uv package manager)
- Node.js 16+ and npm
- `.docx` files in the `docs/` folder

### Installation

**1. Install Backend Dependencies:**
```bash
cd backend
uv pip install --system -r requirements.txt
cd ..
```

**2. Install Frontend Dependencies:**
```bash
cd frontend
npm install
cd ..
```

### Running the Application

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

### Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Usage

1. Place `.docx` files in the `docs/` folder (2 sample files included)
2. Open http://localhost:3000 in your browser
3. Click **"Run New Analysis"** in the left panel
4. Wait 10-30 seconds for completion
5. Explore results:
   - View similarity scores in the dashboard
   - Click "View Duplicates" for detailed matches
   - Click "View Document" to see highlighted content

## Project Structure

```
├── backend/                 # FastAPI Python backend
│   ├── main.py             # API server with endpoints
│   ├── analyzer.py         # Analysis runner and result parser
│   ├── converter.py        # DOCX to HTML converter
│   └── requirements.txt    # Python dependencies
│
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── api.ts         # API client
│   │   ├── App.tsx        # Main application
│   │   └── main.tsx       # Entry point
│   └── package.json       # Node dependencies
│
├── docs/                  # Place .docx files here
├── dedup_out/            # Analysis output (auto-generated)
└── corpus_dedup_runner.py # Core analysis script
```

## API Endpoints

- `GET /api/analysis/status` - Check analysis status
- `POST /api/analysis/run` - Trigger new analysis
- `GET /api/documents` - List documents with metrics
- `GET /api/document/{doc_name}` - Get document HTML
- `GET /api/duplicates/{doc_name}` - Get duplicates for document
- `GET /api/highlights/{doc_name}` - Get highlight information
- `GET /api/similarity-matrix` - Get document similarity matrix

## Configuration

### Analysis Parameters

Configure in the UI or modify defaults in `backend/main.py`:

- `min_sentence_words`: Minimum words per sentence (default: 8)
- `sim_hamming_strict`: Strict Hamming distance threshold (default: 6)
- `sim_hamming_moderate`: Moderate Hamming distance threshold (default: 8)
- `use_embeddings`: Enable semantic matching (slower, more comprehensive)

### Frontend Customization

Edit `frontend/src/index.css` to customize highlight colors:

```css
.highlight-exact { background-color: rgba(239, 68, 68, 0.3); }
.highlight-simhash { background-color: rgba(249, 115, 22, 0.3); }
.highlight-embedding { background-color: rgba(234, 179, 8, 0.3); }
```

## Technology Stack

### Backend
- FastAPI - Modern Python web framework
- Pandas - Data manipulation
- python-docx - Document parsing
- sentence-transformers - Embeddings (optional)

### Frontend
- React 18 - UI framework
- TypeScript - Type safety
- Vite - Build tool
- TailwindCSS - Styling
- Axios - HTTP client

## Troubleshooting

**Port already in use:**
- Stop other applications using ports 8000 or 3000
- Or change port numbers in config files

**"Module not found":**
- Run `uv pip install --system -r backend/requirements.txt`
- Run `npm install` in frontend folder

**"No documents found":**
- Add `.docx` files to the `docs/` folder
- Run the analysis

**Analysis not completing:**
- Check both servers are running
- Check browser console (F12) for errors
- Check backend terminal for Python errors

## Additional Documentation

- **Detailed Documentation**: See `README_FRONTEND.md` for comprehensive guide
- **Analysis Tool**: See `README_corpus_dedup_runner.md` for analysis details
- **Quick Reference**: See `QUICKSTART.md` for fast setup

## License

Internal use - adapt as needed.

## Credits

Built on top of the corpus_dedup_runner.py sentence-level duplicate detection system.
