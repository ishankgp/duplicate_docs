# Duplicate Document Detection - Frontend & Backend

A modern web application for detecting and visualizing duplicate content across `.docx` documents using React + TypeScript frontend and FastAPI backend.

## Features

- **Document Dashboard**: View all documents ranked by similarity score
- **Duplicate Detection**: Exact, near-duplicate (SimHash), and semantic (embeddings) matching
- **Document Viewer**: View documents with duplicate sentences highlighted in color
- **Comparison View**: Side-by-side comparison of duplicate sentence pairs
- **Interactive Analysis**: Run analysis with configurable parameters
- **Real-time Updates**: Background analysis with status polling

## Architecture

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
├── dedup_out/            # Analysis output (generated)
└── corpus_dedup_runner.py # Core analysis script
```

## Installation

### Prerequisites

- Python 3.8+
- Node.js 16+ and npm
- .docx files in the `docs/` folder

### Backend Setup

1. Install Python dependencies:

```bash
cd backend
pip install -r requirements.txt
```

2. Return to project root:

```bash
cd ..
```

### Frontend Setup

1. Install Node dependencies:

```bash
cd frontend
npm install
```

2. Return to project root:

```bash
cd ..
```

## Running the Application

### Method 1: Manual Start (Two Terminals)

**Terminal 1 - Backend:**

```bash
cd backend
python main.py
```

The API will be available at `http://localhost:8000`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Method 2: Using the Helper Scripts

**Windows:**

```bash
start_app.bat
```

**Linux/Mac:**

```bash
chmod +x start_app.sh
./start_app.sh
```

## Usage

1. **Add Documents**: Place `.docx` files in the `docs/` folder

2. **Run Analysis**:
   - Open `http://localhost:3000` in your browser
   - Click "Run New Analysis" in the left panel
   - Optionally enable embeddings for semantic matching (slower)
   - Wait for analysis to complete

3. **View Results**:
   - **Dashboard**: See all documents ranked by similarity
   - **View Duplicates**: Click to see detailed sentence-level matches
   - **View Document**: Click to see the document with highlights

4. **Filter and Explore**:
   - Filter by match type (Exact, Near-Duplicate, Semantic)
   - Search documents by name
   - Sort by various metrics
   - Click highlighted sentences for details

## API Endpoints

- `GET /api/analysis/status` - Check analysis status
- `POST /api/analysis/run` - Trigger new analysis
- `GET /api/documents` - List documents with metrics
- `GET /api/document/{doc_name}` - Get document HTML with sentence IDs
- `GET /api/duplicates/{doc_name}` - Get all duplicates for a document
- `GET /api/highlights/{doc_name}` - Get highlight information
- `GET /api/similarity-matrix` - Get document similarity matrix

## Color Coding

- 🔴 **Red**: Exact matches (identical sentences)
- 🟠 **Orange**: Near-duplicates (SimHash, slight variations)
- 🟡 **Yellow**: Semantic matches (similar meaning, embeddings)

## Configuration

### Analysis Parameters

Edit in the Analysis Control panel or modify defaults in `backend/main.py`:

- `min_sentence_words`: Minimum words per sentence (default: 8)
- `sim_hamming_strict`: Strict Hamming distance threshold (default: 6)
- `sim_hamming_moderate`: Moderate Hamming distance threshold (default: 8)
- `use_embeddings`: Enable semantic matching (slower, more comprehensive)

### Frontend Customization

Edit `frontend/src/index.css` to customize colors:

```css
.highlight-exact { background-color: rgba(239, 68, 68, 0.3); }
.highlight-simhash { background-color: rgba(249, 115, 22, 0.3); }
.highlight-embedding { background-color: rgba(234, 179, 8, 0.3); }
```

## Performance

- **Backend**: FastAPI is async and handles analysis in background tasks
- **Frontend**: React with efficient rendering and caching
- **Scaling**: Designed to handle 1000s of documents
  - Pagination in UI
  - Incremental loading
  - Document caching

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Change port in backend/main.py, line at bottom:
uvicorn.run(app, host="0.0.0.0", port=8001)  # Changed from 8000
```

**Analysis fails:**
- Ensure `corpus_dedup_runner.py` is in the project root
- Check that `docs/` folder exists with `.docx` files
- Verify all Python dependencies are installed

### Frontend Issues

**Port already in use:**
```bash
# Change port in frontend/vite.config.ts:
server: { port: 3001 }  # Changed from 3000
```

**API connection errors:**
- Ensure backend is running on port 8000
- Check CORS settings in `backend/main.py`
- Verify API_BASE_URL in `frontend/src/api.ts`

### Common Issues

**No documents found:**
- Place `.docx` files in the `docs/` folder
- Run an analysis first

**Highlights not working:**
- Clear browser cache
- Ensure analysis completed successfully
- Check browser console for errors

## Development

### Backend Development

```bash
cd backend
python main.py
# API auto-reloads on file changes (uvicorn feature)
```

### Frontend Development

```bash
cd frontend
npm run dev
# Vite provides hot module replacement
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

**Backend:**
```bash
# Use gunicorn or uvicorn for production:
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Technology Stack

### Backend
- FastAPI - Modern Python web framework
- Pandas - Data manipulation
- NumPy - Numerical operations
- python-docx - Document parsing
- sentence-transformers - Embeddings (optional)
- FAISS - Similarity search (optional)

### Frontend
- React 18 - UI framework
- TypeScript - Type safety
- Vite - Build tool
- TailwindCSS - Styling
- Axios - HTTP client
- React Router - Routing

## License

Internal use - adapt as needed.

## Credits

Built on top of the corpus_dedup_runner.py sentence-level duplicate detection system.

