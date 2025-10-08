# Testing Guide - Duplicate Document Detection Frontend

This guide will help you test the complete workflow with the existing 2 documents.

## Prerequisites

Before testing, ensure:

1. ✅ Backend dependencies installed (`pip install -r backend/requirements.txt`)
2. ✅ Frontend dependencies installed (`cd frontend && npm install`)
3. ✅ Two `.docx` files exist in the `docs/` folder

## Step-by-Step Testing

### 1. Start the Backend

**Windows:**
```bash
start_backend.bat
```

**Linux/Mac:**
```bash
chmod +x start_backend.sh
./start_backend.sh
```

You should see:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. Start the Frontend

In a **new terminal**:

**Windows:**
```bash
start_frontend.bat
```

**Linux/Mac:**
```bash
chmod +x start_frontend.sh
./start_frontend.sh
```

You should see:
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 3. Open the Application

1. Open your browser
2. Navigate to `http://localhost:3000`
3. You should see the Duplicate Document Detector interface

### 4. Run Initial Analysis

1. Look at the left panel "Analysis Control"
2. Click **"Run New Analysis"** button
3. Wait for the analysis to complete (10-30 seconds)
4. You should see:
   - Status changes to "Complete"
   - Statistics appear (documents, sentences, pairs)
   - Dashboard shows the 2 documents on the right

### 5. Test Dashboard Features

**View Documents:**
- Verify both documents appear in the dashboard
- Check similarity scores are displayed
- Note the matched sentences count

**Sorting:**
- Try sorting by different fields (Similarity Score, Match %, etc.)
- Verify the order changes

**View Modes:**
- Switch between "Grid View" and "Table View"
- Both should display the same data in different layouts

**Search:**
- Type part of a document name in the search box
- Verify filtering works

### 6. Test Document Viewer

1. Click **"View Document"** button on any document
2. A modal should open showing:
   - Document content
   - Highlighted duplicate sentences (colored)
   - Sidebar with list of duplicates
3. Test filters:
   - Click "Exact", "Near-Duplicate", "Semantic" filters
   - Verify highlights update accordingly
4. Test interactions:
   - Click a sentence in the sidebar
   - Document should scroll to that sentence
   - Sentence should flash with a blue ring
5. Hover over highlighted sentences
   - Verify hover effect works
6. Click the X or outside to close

### 7. Test Document Comparison

1. Click **"View Duplicates"** button on any document
2. A modal should open showing:
   - Statistics bar (Total, Exact, Near-Dup, Semantic, Blocks)
   - List of related documents in left sidebar
   - Sentence pairs in the main area

3. Test filters:
   - Click "All", "Exact", "Near-Dup", "Semantic" buttons
   - Verify the sentence pair list updates

4. Test document filter:
   - Click on a document name in the left sidebar
   - Verify only pairs with that document show

5. Test sorting:
   - Switch between "By Sentence ID" and "By Match Type"
   - Verify order changes

6. Review sentence pairs:
   - Each pair should show:
     - Match type badge (colored)
     - Sentence IDs
     - Both document names
     - Text from both documents
     - Similarity metrics (Hamming/Cosine)

7. Click "View Document" button in header
   - Should open Document Viewer for the current document

### 8. Test Analysis with Embeddings (Optional)

If you have `sentence-transformers` and `faiss-cpu` installed:

1. In Analysis Control, click "▶ Configuration Options"
2. Check "Use Embeddings"
3. Click "Run New Analysis"
4. Wait longer (embeddings are slower)
5. Verify semantic matches appear (yellow highlights)

### 9. Test Re-analysis

1. Modify a document in the `docs/` folder (add/remove text)
2. Run analysis again
3. Verify results update in the dashboard
4. Check that the cache is cleared (new results show)

### 10. Test Error Handling

**No Documents:**
1. Move all files out of `docs/` folder
2. Run analysis
3. Should show "No .docx files found" error

**Backend Down:**
1. Stop the backend server (Ctrl+C)
2. Try to run analysis from frontend
3. Should show connection error
4. Restart backend and verify it recovers

## Expected Results with 2 Sample Docs

Based on the README, with 2 real documents you should see:

- ✅ ~2,100 sentences kept
- ✅ ~14 exact duplicate pairs
- ✅ ~547 SimHash strict pairs (≤6 bits)
- ✅ ~1,628 SimHash moderate pairs (≤8 bits)
- ✅ ~5 block matches (consecutive sentences)

## Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts and loads at localhost:3000
- [ ] Analysis runs successfully
- [ ] Dashboard displays documents
- [ ] Sorting and filtering work
- [ ] Document Viewer opens and highlights sentences
- [ ] Document Comparison shows sentence pairs
- [ ] All filters work correctly
- [ ] Clicking elements navigates properly
- [ ] Modal close buttons work
- [ ] No console errors in browser DevTools
- [ ] Re-analysis updates results

## Common Issues

### Issue: "Module not found" errors in backend
**Solution:** Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### Issue: "Cannot find module" errors in frontend
**Solution:** Install dependencies:
```bash
cd frontend
npm install
```

### Issue: Port already in use
**Solution:** 
- Backend: Change port in `backend/main.py`
- Frontend: Change port in `frontend/vite.config.ts`

### Issue: CORS errors in browser
**Solution:** Check that:
- Backend is running on port 8000
- Frontend is accessing `http://localhost:8000`
- CORS middleware is configured in `backend/main.py`

### Issue: Highlights not appearing
**Solution:**
- Ensure analysis completed successfully
- Check browser console for errors
- Try clearing browser cache
- Verify `dedup_out/` folder has CSV files

## Manual API Testing

You can also test the backend API directly:

```bash
# Check status
curl http://localhost:8000/api/analysis/status

# Get documents (after analysis)
curl http://localhost:8000/api/documents

# Get duplicates for a specific document
curl http://localhost:8000/api/duplicates/DOCUMENT_NAME.docx
```

Or open `http://localhost:8000/docs` for interactive API documentation (FastAPI Swagger UI).

## Performance Testing

For testing with many documents:

1. Add 50+ documents to `docs/` folder
2. Run analysis (may take several minutes)
3. Verify:
   - Dashboard loads quickly
   - Pagination/scrolling is smooth
   - Filters respond quickly
   - Document viewer doesn't lag

## Success Criteria

✅ All features work as described  
✅ No errors in browser console  
✅ No errors in backend terminal  
✅ Analysis produces reasonable results  
✅ UI is responsive and intuitive  
✅ Highlighting is accurate and visible  
✅ Sentence pairs match correctly  

## Next Steps

After successful testing:

1. Try with your own document corpus
2. Adjust thresholds for your use case
3. Customize colors/styling if needed
4. Consider adding more features (see README)

## Support

If you encounter issues:

1. Check this guide's "Common Issues" section
2. Review `README_FRONTEND.md` for configuration
3. Check browser DevTools console for errors
4. Check backend terminal for Python errors
5. Verify all dependencies are installed

