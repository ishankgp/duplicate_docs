"""
Analyzer module to run corpus_dedup_runner.py and parse results.
"""

import subprocess
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import pandas as pd
from collections import defaultdict


class DuplicateAnalyzer:
    """Handles running analysis and parsing results."""
    
    def __init__(self, docs_dir: str = "docs", output_dir: str = "dedup_out"):
        # Get paths relative to the project root (parent of backend/)
        root_dir = Path(__file__).parent.parent
        self.docs_dir = root_dir / docs_dir
        self.output_dir = root_dir / output_dir
        self.runner_script = root_dir / "corpus_dedup_runner.py"
        
    def run_analysis(self, use_embeddings: bool = False, **kwargs) -> Dict[str, Any]:
        """
        Run the corpus_dedup_runner.py script.
        
        Args:
            use_embeddings: Whether to use embeddings for semantic matching
            **kwargs: Additional arguments to pass to the runner
            
        Returns:
            Dict with status and summary
        """
        if not self.runner_script.exists():
            raise FileNotFoundError(f"Runner script not found: {self.runner_script}")
        
        if not self.docs_dir.exists():
            raise FileNotFoundError(f"Docs directory not found: {self.docs_dir}")
        
        # Build command
        cmd = [
            "python",
            str(self.runner_script),
            "--input_dir", str(self.docs_dir),
            "--out_dir", str(self.output_dir)
        ]
        
        if use_embeddings:
            cmd.append("--use_embeddings")
        
        # Add optional parameters
        for key, value in kwargs.items():
            cmd.extend([f"--{key}", str(value)])
        
        # Run the analysis
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            if result.returncode != 0:
                return {
                    "success": False,
                    "error": result.stderr,
                    "stdout": result.stdout
                }
            
            # Load summary
            summary = self.get_summary()
            
            return {
                "success": True,
                "summary": summary,
                "stdout": result.stdout
            }
            
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": "Analysis timed out after 5 minutes"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def has_results(self) -> bool:
        """Check if analysis results exist."""
        summary_file = self.output_dir / "summary.json"
        return summary_file.exists()
    
    def get_summary(self) -> Optional[Dict[str, Any]]:
        """Load the summary.json file."""
        summary_file = self.output_dir / "summary.json"
        if not summary_file.exists():
            return None
        
        with open(summary_file, 'r') as f:
            return json.load(f)
    
    def get_doc_metrics(self) -> List[Dict[str, Any]]:
        """Load document metrics with similarity scores."""
        metrics_file = self.output_dir / "doc_metrics.csv"
        if not metrics_file.exists():
            return []
        
        df = pd.read_csv(metrics_file)
        
        # Calculate aggregate similarity score
        df['similarity_score'] = (
            df['matched_sentences_pct'] * 0.6 + 
            df['in_block_sentences_pct'] * 0.4
        )
        
        # Sort by similarity score descending
        df = df.sort_values('similarity_score', ascending=False)
        
        return df.to_dict('records')
    
    def get_exact_pairs(self) -> List[Dict[str, Any]]:
        """Load exact sentence pairs."""
        file_path = self.output_dir / "exact_sentence_pairs.csv"
        if not file_path.exists():
            return []
        
        df = pd.read_csv(file_path)
        return df.to_dict('records')
    
    def get_simhash_pairs(self, strict: bool = False) -> List[Dict[str, Any]]:
        """Load SimHash sentence pairs."""
        filename = "simhash_sentence_pairs_strict.csv" if strict else "simhash_sentence_pairs.csv"
        file_path = self.output_dir / filename
        if not file_path.exists():
            return []
        
        df = pd.read_csv(file_path)
        return df.to_dict('records')
    
    def get_embedding_pairs(self, strict: bool = False) -> List[Dict[str, Any]]:
        """Load embedding sentence pairs."""
        filename = "embed_sentence_pairs_strict.csv" if strict else "embed_sentence_pairs.csv"
        file_path = self.output_dir / filename
        if not file_path.exists():
            return []
        
        df = pd.read_csv(file_path)
        return df.to_dict('records')
    
    def get_block_matches(self) -> List[Dict[str, Any]]:
        """Load block matches."""
        file_path = self.output_dir / "block_matches.csv"
        if not file_path.exists():
            return []
        
        df = pd.read_csv(file_path)
        return df.to_dict('records')
    
    def get_duplicates_for_doc(self, doc_name: str) -> Dict[str, Any]:
        """
        Get all duplicate information for a specific document.
        
        Returns:
            {
                "exact": List of exact matches,
                "simhash": List of simhash matches,
                "embedding": List of embedding matches,
                "blocks": List of block matches,
                "duplicate_sentences": Set of sentence IDs that are duplicates
            }
        """
        result = {
            "exact": [],
            "simhash": [],
            "embedding": [],
            "blocks": [],
            "duplicate_sentences": set()
        }
        
        # Exact pairs
        for pair in self.get_exact_pairs():
            if pair['docA'] == doc_name:
                result["exact"].append({
                    "other_doc": pair['docB'],
                    "sent_id": pair['sentA_id'],
                    "other_sent_id": pair['sentB_id'],
                    "text": pair['textA'],
                    "other_text": pair['textB'],
                    "type": "exact",
                    "category": pair.get('category', 'cross-document')
                })
                result["duplicate_sentences"].add(pair['sentA_id'])
            elif pair['docB'] == doc_name:
                result["exact"].append({
                    "other_doc": pair['docA'],
                    "sent_id": pair['sentB_id'],
                    "other_sent_id": pair['sentA_id'],
                    "text": pair['textB'],
                    "other_text": pair['textA'],
                    "type": "exact",
                    "category": pair.get('category', 'cross-document')
                })
                result["duplicate_sentences"].add(pair['sentB_id'])
        
        # SimHash pairs
        for pair in self.get_simhash_pairs():
            if pair['docA'] == doc_name:
                result["simhash"].append({
                    "other_doc": pair['docB'],
                    "sent_id": pair['sentA_id'],
                    "other_sent_id": pair['sentB_id'],
                    "text": pair['textA'],
                    "other_text": pair['textB'],
                    "hamming": pair['hamming'],
                    "type": "simhash",
                    "category": pair.get('category', 'cross-document')
                })
                result["duplicate_sentences"].add(pair['sentA_id'])
            elif pair['docB'] == doc_name:
                result["simhash"].append({
                    "other_doc": pair['docA'],
                    "sent_id": pair['sentB_id'],
                    "other_sent_id": pair['sentA_id'],
                    "text": pair['textB'],
                    "other_text": pair['textA'],
                    "hamming": pair['hamming'],
                    "type": "simhash",
                    "category": pair.get('category', 'cross-document')
                })
                result["duplicate_sentences"].add(pair['sentB_id'])
        
        # Embedding pairs
        for pair in self.get_embedding_pairs():
            if pair['docA'] == doc_name:
                result["embedding"].append({
                    "other_doc": pair['docB'],
                    "sent_id": pair['sentA_id'],
                    "other_sent_id": pair['sentB_id'],
                    "text": pair['textA'],
                    "other_text": pair['textB'],
                    "cosine": pair['cosine'],
                    "type": "embedding",
                    "category": pair.get('category', 'cross-document')
                })
                result["duplicate_sentences"].add(pair['sentA_id'])
            elif pair['docB'] == doc_name:
                result["embedding"].append({
                    "other_doc": pair['docA'],
                    "sent_id": pair['sentB_id'],
                    "other_sent_id": pair['sentA_id'],
                    "text": pair['textB'],
                    "other_text": pair['textA'],
                    "cosine": pair['cosine'],
                    "type": "embedding",
                    "category": pair.get('category', 'cross-document')
                })
                result["duplicate_sentences"].add(pair['sentB_id'])
        
        # Block matches
        for block in self.get_block_matches():
            if block['docA'] == doc_name:
                result["blocks"].append({
                    "other_doc": block['docB'],
                    "start": block['A_start'],
                    "end": block['A_end'],
                    "other_start": block['B_start'],
                    "other_end": block['B_end'],
                    "length": block['len_sent']
                })
                # Add all sentences in block
                for sid in range(block['A_start'], block['A_end'] + 1):
                    result["duplicate_sentences"].add(sid)
            elif block['docB'] == doc_name:
                result["blocks"].append({
                    "other_doc": block['docA'],
                    "start": block['B_start'],
                    "end": block['B_end'],
                    "other_start": block['A_start'],
                    "other_end": block['A_end'],
                    "length": block['len_sent']
                })
                # Add all sentences in block
                for sid in range(block['B_start'], block['B_end'] + 1):
                    result["duplicate_sentences"].add(sid)
        
        # Convert set to sorted list
        result["duplicate_sentences"] = sorted(list(result["duplicate_sentences"]))
        
        return result
    
    def get_document_relationships(self, doc_name: str) -> List[Dict[str, Any]]:
        """
        Get all documents related to the specified document with detailed metrics.
        
        Args:
            doc_name: Name of the document
            
        Returns:
            List of related documents with match counts and overlap percentages
        """
        # Count matches by document and type
        relationships = defaultdict(lambda: {
            'doc': '',
            'exact_matches': 0,
            'simhash_matches': 0,
            'embedding_matches': 0,
            'total_matches': 0
        })
        
        # Count exact matches
        for pair in self.get_exact_pairs():
            if pair['docA'] == doc_name and pair['docB'] != doc_name:
                relationships[pair['docB']]['doc'] = pair['docB']
                relationships[pair['docB']]['exact_matches'] += 1
            elif pair['docB'] == doc_name and pair['docA'] != doc_name:
                relationships[pair['docA']]['doc'] = pair['docA']
                relationships[pair['docA']]['exact_matches'] += 1
        
        # Count simhash matches
        for pair in self.get_simhash_pairs():
            if pair['docA'] == doc_name and pair['docB'] != doc_name:
                relationships[pair['docB']]['doc'] = pair['docB']
                relationships[pair['docB']]['simhash_matches'] += 1
            elif pair['docB'] == doc_name and pair['docA'] != doc_name:
                relationships[pair['docA']]['doc'] = pair['docA']
                relationships[pair['docA']]['simhash_matches'] += 1
        
        # Count embedding matches
        for pair in self.get_embedding_pairs():
            if pair['docA'] == doc_name and pair['docB'] != doc_name:
                relationships[pair['docB']]['doc'] = pair['docB']
                relationships[pair['docB']]['embedding_matches'] += 1
            elif pair['docB'] == doc_name and pair['docA'] != doc_name:
                relationships[pair['docA']]['doc'] = pair['docA']
                relationships[pair['docA']]['embedding_matches'] += 1
        
        # Calculate totals and percentages
        metrics = {m['doc']: m for m in self.get_doc_metrics()}
        current_doc_sentences = metrics.get(doc_name, {}).get('total_sentences', 1)
        
        result = []
        for other_doc, counts in relationships.items():
            total = counts['exact_matches'] + counts['simhash_matches'] + counts['embedding_matches']
            counts['total_matches'] = total
            
            # Calculate overlap percentage based on current document's sentence count
            counts['overlap_percentage'] = round((total / current_doc_sentences) * 100, 2) if current_doc_sentences > 0 else 0
            
            result.append(counts)
        
        # Sort by total matches descending
        result.sort(key=lambda x: x['total_matches'], reverse=True)
        
        return result
    
    def get_similarity_matrix(self) -> Dict[str, Dict[str, float]]:
        """
        Build a document-to-document similarity matrix.
        
        Returns:
            Dict mapping docA -> docB -> similarity_score
        """
        matrix = defaultdict(lambda: defaultdict(float))
        
        # Count matches between document pairs
        match_counts = defaultdict(lambda: defaultdict(int))
        
        for pair in self.get_exact_pairs():
            match_counts[pair['docA']][pair['docB']] += 1
            match_counts[pair['docB']][pair['docA']] += 1
        
        for pair in self.get_simhash_pairs():
            match_counts[pair['docA']][pair['docB']] += 1
            match_counts[pair['docB']][pair['docA']] += 1
        
        for pair in self.get_embedding_pairs():
            match_counts[pair['docA']][pair['docB']] += 1
            match_counts[pair['docB']][pair['docA']] += 1
        
        # Get doc metrics for sentence counts
        metrics = {m['doc']: m for m in self.get_doc_metrics()}
        
        # Calculate normalized similarity scores
        for docA, targets in match_counts.items():
            total_sents_A = metrics.get(docA, {}).get('total_sentences', 1)
            for docB, count in targets.items():
                total_sents_B = metrics.get(docB, {}).get('total_sentences', 1)
                # Normalize by average document length
                avg_sents = (total_sents_A + total_sents_B) / 2
                matrix[docA][docB] = (count / avg_sents) * 100 if avg_sents > 0 else 0
        
        return dict(matrix)

