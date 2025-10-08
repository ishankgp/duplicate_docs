
# Corpus Near-Duplicate & Reuse Detector (for `.docx`)

This repository contains a single-runner script, **`corpus_dedup_runner.py`**, that detects **exact**, **near-duplicate**, and **semantic** (optional embeddings) overlaps at the **sentence** level across a folder of Microsoft Word `.docx` files, merges matched sentences into **reused blocks**, and emits **per-document** and **corpus** metrics in CSV/JSON.

It consolidates the learnings from multiple approaches we tried progressively, and bakes in defaults that worked well on real SOP/Procedure files.

---

## TL;DR

- **Unit of analysis:** sentences (not whole docs, not large chunks).
- **Three layers:**
  1. **Exact** sentence matches → fast, precise.
  2. **Near-duplicate** sentence matches via **SimHash + LSH** → tolerant to light edits.
  3. **Semantic** (optional) via **embeddings + cosine** → catches paraphrases.
- **Outputs:** sentence-level pairs, merged **block** matches (adjacent sentences), **per-doc** metrics, and a **summary.json**.
- **Use this when:** you want to quantify and reduce redundancy, identify reused fragments, and pick canonical sources.

---

## What This Tool Does

1. **Extracts text** from `.docx` by reading `word/document.xml` (no external docx lib required).
2. **Segments into sentences** (with a simple splitter and additional breaking of very long lines).
3. **Normalizes** (lowercase, normalize quotes/whitespace).
4. **Exact match layer:** builds an inverted index over normalized sentences to find **literal clones** across docs.
5. **Near-duplicate layer:** computes **64-bit SimHash** per sentence using **word n-grams** (default 3-grams), uses **banded LSH** (8×8) to generate candidates, and verifies with **Hamming distance** thresholds.
6. **Semantic layer (optional):** computes **sentence embeddings** (e.g., `all-MiniLM-L6-v2`) and uses **FAISS** to retrieve top-k nearest neighbors; thresholds on **cosine similarity** (e.g., 0.90 strict).
7. **Merges consecutive sentence matches** to produce **block reuse** (paragraph-like sequences).
8. **Computes metrics:** per-doc counts and percentages, plus corpus-level summary.

---

## Why Sentences (and Not Whole-Doc / Big Chunks)?

- A single matching sentence inside a 400-word block is **diluted** by hundreds of non-matching words.
- One fingerprint for a long block usually **won't move** enough when only one sentence overlaps.
- Sentence-level detection is **granular, measurable**, and easily rolled up into blocks and per-doc metrics.

---

## Our Progressive Approach & Learnings

Below is what we tried, what worked, and why we changed direction.

### 1) Whole-Document SimHash → **Didn't work** for small overlaps
- **Result:** Large Hamming distance (e.g., 31/64) despite shared sentences.
- **Why:** One 64-bit signature for an entire doc **dilutes** the effect of a few overlapping lines.

### 2) Section-Level (~400 words) SimHash → **Under-recall**
- **Result:** Found **0** matching chunks between sample docs.
- **Why:** Overlap at sentence scale often too small to flip enough bits for the **chunk** fingerprint.

### 3) Section-Level char TF-IDF (3-5-grams) → **Still under-recall**
- **Result:** Cosine below threshold for chunk comparisons.
- **Why:** Distinctive content in each chunk dominated; the shared sentence did not lift the whole chunk’s similarity.

### 4) Targeted sentence-level fuzzy check (sanity test) → **Worked**
- **Result:** The suspect sentence appeared **exactly** in one doc and **slightly reworded** in the other (token-set Jaccard ~0.79).
- **Learning:** The **unit** must be **sentence** for reliable detection.

### 5) Exact sentence matches (normalized) → **Worked**
- **Result:** Found **literal clones** (e.g., 14-22 exact shared sentences in tests).
- **Learning:** Cheap baseline; great precision; remove obvious clones first.

### 6) Sentence-level SimHash + LSH → **Worked**
- **Result:** Hundreds of **near-duplicate** pairs surfaced (e.g., 547 strict ≤6 bits; 1,628 moderate ≤8 bits).
- **Learning:** Robust to punctuation/stopword changes at sentence granularity. LSH is probabilistic—some pairs can be missed; tune thresholds and n-grams.

### 7) Sentence-level embeddings (recommended for paraphrases) → **Best for meaning**
- **Result (design):** Captures "are vs should be"-type changes, reordered phrases, and paraphrases.
- **Learning:** Heavier compute, but **necessary** to capture semantic redundancy; use strict cosine thresholds (≥0.90) to keep precision high.

---

## Final Strategy (What You Should Run)

1. **Preprocess & segment**: Extract text → split into **sentences** → normalize.
2. **Exact sentences**: hash & index; report duplicates and per-doc % identical.
3. **Near-duplicates**: **SimHash (64-bit)** per sentence with **word 3-grams**; **LSH 8×8**; verify with **Hamming ≤ 6** (strict) and **≤ 8** (moderate). Skip very short lines (<8 words) or treat with stricter rules.
4. **Semantic paraphrases (optional)**: **Embeddings + FAISS**, cosine **≥ 0.90** (strict) / **0.87-0.90** (moderate), top-k=8 per sentence.
5. **Merge to blocks**: Glue adjacent matched sentences into **reused blocks** (set `--block_min_run`, default 2).
6. **Metrics**: per-doc `% matched sentences` and `% in blocks`; corpus summary; **boilerplate** catalog.
7. **Calibrate thresholds** on a labeled sample (100-200 pairs) to dial in precision/recall.

---

## Installation

```bash
# Minimal (exact + SimHash + LSH):
pip install pandas numpy tqdm

# Add semantic (optional):
pip install sentence-transformers faiss-cpu
```

> No extra package is needed for `.docx` parsing here—`corpus_dedup_runner.py` reads `word/document.xml` directly.

---

## Usage

```bash
python corpus_dedup_runner.py \
  --input_dir /path/to/docx \
  --out_dir ./dedup_out
```

Enable **embeddings** (semantic paraphrases):

```bash
python corpus_dedup_runner.py \
  --input_dir /path/to/docx \
  --out_dir ./dedup_out \
  --use_embeddings \
  --embed_model sentence-transformers/all-MiniLM-L6-v2 \
  --embed_threshold_strict 0.90 \
  --embed_threshold_moderate 0.88 \
  --topk 8
```

Key flags to tune:

- `--min_sentence_words 8` — ignore very short sentences for stability.
- `--sim_ngram 3` — SimHash word n-gram size (3 by default; try 2 for more recall).
- `--sim_hamming_strict 6` / `--sim_hamming_moderate 8` — thresholds for near-dupes.
- `--block_min_run 2` — minimum consecutive sentence matches to form a block.

---

## Outputs

All outputs go to `--out_dir`:

- **`exact_sentence_pairs.csv`** — literal clones (normalized).
- **`simhash_sentence_pairs.csv`** / **`simhash_sentence_pairs_strict.csv`** — near-dupe sentences (moderate/strict).
- **`embed_sentence_pairs.csv`** / **`embed_sentence_pairs_strict.csv`** — semantic pairs if embeddings enabled.
- **`block_matches.csv`** — merged runs of adjacent matched sentences (reused blocks).
- **`doc_metrics.csv`** — per-doc totals, matched counts, and percentages.
- **`summary.json`** — overall counts, parameters, and document list.

**How to read `doc_metrics.csv`:**

- `matched_sentences_any` — sentences that matched by **any** method (exact OR SimHash OR embeddings).
- `in_block_sentences` — sentences that are part of a **merged block** (adjacent matches).
- `%` columns show the share of each.

---

## Demo Results (Two Real Docs)

With embeddings **disabled**, sentence length **≥8** words:

- **Sentences kept:** 2,100
- **Exact duplicates:** 14 sentence pairs
- **Near-duplicates (SimHash):** 547 (strict ≤6 bits), 1,628 (moderate ≤8 bits)
- **Block matches:** 5 sequences of adjacent matched sentences

These confirm that **sentence-level** methods surface both exact and lightly edited reuse even when whole-doc or big-chunk methods do not.

---

## Boilerplate Handling (Important)

Some sentences (e.g., legal disclaimers, headers) occur in **many** documents. These can inflate duplicate metrics. Recommended practice:

- Compute **sentence frequency** across the corpus.  
- Whitelist “always present” boilerplate (appearing in >X% of docs).  
- Report boilerplate separately and exclude it from reuse percentages if desired.

---

## Quality & Threshold Tuning

1. Label ~100-200 sentence pairs as **same / near-same / different**.
2. Tune:
   - **SimHash hamming**: start at 6 (strict) and 8 (moderate).
   - **Embedding cosine**: start at 0.90 (strict) and 0.88 (moderate).
   - **Min sentence length** and **n-gram size**.
3. Validate block merging: ensure **block_min_run** doesn't create noisy blocks (2-3 is sensible).

---

## Performance & Scaling (7,000 docs)

- **Exact** + **SimHash**: CPU-light, streaming-friendly; handles millions of sentences.
- **Embeddings**: batch encode (1-5k sentences per batch), build one FAISS index, query **top-k** once per sentence.
- Store intermediate artifacts (sentence hashes/fingerprints) for incremental updates.

---

## Known Limitations / Edge Cases

- **Probabilistic LSH**: can miss some pairs. You can loosen thresholds (e.g., Hamming ≤10) or switch n‑gram size.  
- **Very short sentences**: noisy. Filter by `--min_sentence_words` or handle separately.  
- **Sentence splitting**: naive splitter may break list items; accuracy improves with domain‑aware splitting.  
- **Docx quirks**: unusual Word constructs may require more robust extraction (fallback: `python-docx`).

---

## Extending the System

- **Heading-aware blocks**: segment by headings, compute per-heading reuse.
- **MinHash (Jaccard)**: add character 5-gram MinHash + LSH for reorder-insensitive overlap.
- **Boilerplate registry**: maintain a curated list & exclusion rules.
- **HTML Dashboard**: render top duplicates per doc with links and filters.

---

## Quick API (Inside the Script)

- **SimHash per sentence:** 64‑bit, word n‑grams (default 3).  
- **LSH**: 8 bands × 8 bits; candidate pairs verified with Hamming distance.  
- **Embeddings (optional):** `sentence-transformers`, FAISS inner product on normalized vectors.  
- **Block merge:** merge adjacent `(sentA, sentB)` pairs into runs (length ≥ `--block_min_run`).

---

## FAQ

**Q:** Why didn't whole-doc SimHash work?  
**A:** Because a single matching sentence is overwhelmed by the rest of the document—its influence on a whole-doc fingerprint is tiny.

**Q:** Why sentence-level?  
**A:** It's the right granularity to capture both exact and lightly edited reuse; then we roll up to blocks and document-level metrics.

**Q:** Do I need embeddings?  
**A:** Use them if you care about **paraphrases**. For copy-edit reuse, **SimHash** is usually enough.

**Q:** How do I avoid counting boilerplate?  
**A:** Frequency-filter sentences that appear in many docs; whitelist them and report separately.

---

## License

Internal use; adapt as needed.

