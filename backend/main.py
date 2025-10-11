"""
FastAPI backend for duplicate document detection system.
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from pathlib import Path
from typing import Optional, List, Dict, Any
import json
from datetime import datetime

from analyzer import DuplicateAnalyzer
from converter import convert_docx_to_html

app = FastAPI(title="Duplicate Document Detection API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:3001"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global analyzer instance
analyzer = DuplicateAnalyzer(docs_dir="docs", output_dir="dedup_out")

# In-memory cache for document conversions
document_cache: Dict[str, Dict[str, Any]] = {}

# Analysis status tracking
analysis_status = {
    "running": False,
    "last_run": None,
    "last_result": None
}


class AnalysisRequest(BaseModel):
    """Request model for triggering analysis."""
    use_embeddings: bool = False
    min_sentence_words: int = 8
    sim_hamming_strict: int = 6
    sim_hamming_moderate: int = 8


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Duplicate Document Detection API",
        "version": "1.0.0",
        "endpoints": {
            "documents": "/api/documents",
            "analysis_status": "/api/analysis/status",
            "run_analysis": "/api/analysis/run",
            "document_content": "/api/document/{doc_name}",
            "duplicates": "/api/duplicates/{doc_name}",
            "highlights": "/api/highlights/{doc_name}",
            "similarity_matrix": "/api/similarity-matrix"
        }
    }


@app.get("/api/analysis/status")
async def get_analysis_status():
    """Check if analysis results exist and get status."""
    has_results = analyzer.has_results()
    summary = analyzer.get_summary() if has_results else None
    
    return {
        "has_results": has_results,
        "running": analysis_status["running"],
        "last_run": analysis_status["last_run"],
        "last_result": analysis_status["last_result"],
        "summary": summary
    }


def run_analysis_task(request: AnalysisRequest):
    """Background task to run analysis."""
    global analysis_status
    
    analysis_status["running"] = True
    analysis_status["last_run"] = datetime.now().isoformat()
    
    try:
        result = analyzer.run_analysis(
            use_embeddings=request.use_embeddings,
            min_sentence_words=request.min_sentence_words,
            sim_hamming_strict=request.sim_hamming_strict,
            sim_hamming_moderate=request.sim_hamming_moderate
        )
        analysis_status["last_result"] = result
        
        # Clear document cache after new analysis
        document_cache.clear()
        
    except Exception as e:
        analysis_status["last_result"] = {
            "success": False,
            "error": str(e)
        }
    finally:
        analysis_status["running"] = False


@app.post("/api/analysis/run")
async def run_analysis(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """Trigger deduplication analysis."""
    if analysis_status["running"]:
        raise HTTPException(status_code=409, detail="Analysis is already running")
    
    # Run analysis in background
    background_tasks.add_task(run_analysis_task, request)
    
    return {
        "message": "Analysis started",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/documents")
async def get_documents(
    sort_by: str = "similarity_score",
    min_similarity: float = 0.0,
    search: Optional[str] = None
):
    """
    List all documents with similarity scores and metrics.
    
    Args:
        sort_by: Field to sort by (similarity_score, matched_sentences_pct, doc)
        min_similarity: Minimum similarity score to include
        search: Search term to filter document names
    """
    if not analyzer.has_results():
        raise HTTPException(status_code=404, detail="No analysis results found. Run analysis first.")
    
    docs = analyzer.get_doc_metrics()
    
    # Filter by minimum similarity
    docs = [d for d in docs if d.get('similarity_score', 0) >= min_similarity]
    
    # Filter by search term
    if search:
        search_lower = search.lower()
        docs = [d for d in docs if search_lower in d['doc'].lower()]
    
    # Sort
    reverse = sort_by != "doc"  # Ascending for doc name, descending for scores
    docs = sorted(docs, key=lambda x: x.get(sort_by, 0), reverse=reverse)
    
    return {
        "documents": docs,
        "total": len(docs)
    }


@app.get("/api/document/{doc_name}")
async def get_document_content(doc_name: str):
    """
    Get document content converted to HTML with sentence IDs.
    
    Args:
        doc_name: Name of the document file
    """
    # Check cache first
    if doc_name in document_cache:
        return document_cache[doc_name]
    
    # Find document path (relative to project root)
    root_dir = Path(__file__).parent.parent
    docs_dir = root_dir / "docs"
    doc_path = docs_dir / doc_name
    
    if not doc_path.exists():
        raise HTTPException(status_code=404, detail=f"Document not found: {doc_name}")
    
    if not doc_path.suffix.lower() == ".docx":
        raise HTTPException(status_code=400, detail="Only .docx files are supported")
    
    try:
        # Convert document
        result = convert_docx_to_html(doc_path)
        
        # Cache result
        document_cache[doc_name] = result
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error converting document: {str(e)}")


@app.get("/api/duplicates/{doc_name}")
async def get_duplicates(doc_name: str, match_type: Optional[str] = None):
    """
    Get all duplicates for a specific document.
    
    Args:
        doc_name: Name of the document file
        match_type: Filter by match type (exact, simhash, embedding, all)
    """
    if not analyzer.has_results():
        raise HTTPException(status_code=404, detail="No analysis results found")
    
    try:
        duplicates = analyzer.get_duplicates_for_doc(doc_name)
        
        # Filter by match type if specified
        if match_type and match_type != "all":
            if match_type in duplicates:
                filtered = {
                    match_type: duplicates[match_type],
                    "duplicate_sentences": duplicates["duplicate_sentences"]
                }
                return filtered
            else:
                raise HTTPException(status_code=400, detail=f"Invalid match type: {match_type}")
        
        return duplicates
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting duplicates: {str(e)}")


@app.get("/api/highlights/{doc_name}")
async def get_highlights(doc_name: str):
    """
    Get duplicate sentence IDs to highlight for a document.
    Returns mapping of sentence ID to highlight type and related documents.
    
    Args:
        doc_name: Name of the document file
    """
    if not analyzer.has_results():
        raise HTTPException(status_code=404, detail="No analysis results found")
    
    try:
        duplicates = analyzer.get_duplicates_for_doc(doc_name)
        
        # Build highlights mapping: sentence_id -> {type, docs, details}
        highlights = {}
        
        # Exact matches (highest priority)
        for match in duplicates.get("exact", []):
            sent_id = match["sent_id"]
            if sent_id not in highlights:
                highlights[sent_id] = {
                    "type": "exact",
                    "priority": 3,
                    "docs": [],
                    "details": []
                }
            highlights[sent_id]["docs"].append(match["other_doc"])
            highlights[sent_id]["details"].append({
                "doc": match["other_doc"],
                "sent_id": match["other_sent_id"],
                "text": match["other_text"]
            })
        
        # SimHash matches
        for match in duplicates.get("simhash", []):
            sent_id = match["sent_id"]
            if sent_id not in highlights:
                highlights[sent_id] = {
                    "type": "simhash",
                    "priority": 2,
                    "docs": [],
                    "details": []
                }
            highlights[sent_id]["docs"].append(match["other_doc"])
            highlights[sent_id]["details"].append({
                "doc": match["other_doc"],
                "sent_id": match["other_sent_id"],
                "text": match["other_text"],
                "hamming": match.get("hamming")
            })
        
        # Embedding matches
        for match in duplicates.get("embedding", []):
            sent_id = match["sent_id"]
            if sent_id not in highlights:
                highlights[sent_id] = {
                    "type": "embedding",
                    "priority": 1,
                    "docs": [],
                    "details": []
                }
            highlights[sent_id]["docs"].append(match["other_doc"])
            highlights[sent_id]["details"].append({
                "doc": match["other_doc"],
                "sent_id": match["other_sent_id"],
                "text": match["other_text"],
                "cosine": match.get("cosine")
            })
        
        # Deduplicate docs lists
        for sent_id in highlights:
            highlights[sent_id]["docs"] = list(set(highlights[sent_id]["docs"]))
        
        return {
            "highlights": highlights,
            "total_highlighted": len(highlights)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting highlights: {str(e)}")


@app.get("/api/similarity-matrix")
async def get_similarity_matrix():
    """Get document-to-document similarity matrix."""
    if not analyzer.has_results():
        raise HTTPException(status_code=404, detail="No analysis results found")
    
    try:
        matrix = analyzer.get_similarity_matrix()
        return {
            "matrix": matrix
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error building similarity matrix: {str(e)}")


@app.get("/api/blocks")
async def get_block_matches():
    """Get all block matches (consecutive duplicate sentences)."""
    if not analyzer.has_results():
        raise HTTPException(status_code=404, detail="No analysis results found")
    
    blocks = analyzer.get_block_matches()
    return {
        "blocks": blocks,
        "total": len(blocks)
    }


@app.get("/api/document/{doc_name}/relationships")
async def get_document_relationships(doc_name: str):
    """
    Get documents related to the specified document with detailed metrics.
    
    Args:
        doc_name: Name of the document file
        
    Returns:
        List of related documents with match counts and overlap percentages
    """
    if not analyzer.has_results():
        raise HTTPException(status_code=404, detail="No analysis results found")
    
    try:
        relationships = analyzer.get_document_relationships(doc_name)
        return {
            "relationships": relationships,
            "total": len(relationships)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting relationships: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

