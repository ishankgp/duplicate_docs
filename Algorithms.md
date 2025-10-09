# Duplicate Detection Algorithms

This document explains the different algorithmic approaches used in the Duplicate Document Detection system.

## 1. Exact Match Detection

### Overview
Identifies sentences that are exactly identical across documents.

### Algorithm
- **Input**: Sentences are determined by splitting the document text using standard sentence boundary detection (e.g., punctuation such as `.`, `!`, `?`), then each sentence is normalized by converting to lowercase and removing punctuation and special characters.
- **Process**:
  1. Convert sentences to lowercase
  2. Remove punctuation and special characters
  3. Compare exact string matches
- **Output**: Pairs of identical sentences

### Use Case
- Detecting verbatim copying (scalable for large document sets due to linear time and space complexity)
- Finding exact duplicates

### Performance
- **Time Complexity**: O(n) — where n is the number of sentences; each sentence is processed once for normalization and exact matching.
- **Space Complexity**: O(n)

### Configuration
- `min_sentence_words`: Minimum words per sentence (default: 8)

## 2. Near-Duplicate Detection (SimHash)

### Overview
Identifies sentences that are nearly identical using SimHash algorithm.

### Algorithm
- **Input**: Normalized sentence text
- **Process**:
  1. Tokenize each sentence into overlapping n-grams (default: 3-grams), where an n-gram is a contiguous sequence of n words from the sentence (e.g., for n=3, "the quick brown fox" yields "the quick brown", "quick brown fox"), to capture local word patterns.
  2. For each sentence, compute a SimHash fingerprint:
     - For example, the sentence "the quick brown fox" with n=3 produces the n-grams "the quick brown" and "quick brown fox".
     - Each n-gram is hashed, and their bitwise representations are combined (added or subtracted per bit position) to form a single fixed-size SimHash for the sentence.
  3. For every pair of sentences, calculate the Hamming distance between their SimHash fingerprints (i.e., count the number of differing bits). For instance, if "the quick brown fox" and "the quick brown dog" have SimHashes that differ in 5 bits, their Hamming distance is 5.
  4. If the Hamming distance is less than a specified threshold (e.g., 6), classify the sentence pair as near-duplicates. This means that even if "the quick brown fox" and "the quick brown dog" differ by just one word, they may still be detected as near-duplicates if their SimHashes are sufficiently similar.
- **Output**: Pairs of similar sentences with Hamming distance

### Use Case
- Detecting paraphrased content
- Finding near-identical sentences

### Performance
- **Time Complexity**: O(n²)
- **Space Complexity**: O(n)

### Configuration
- `sim_ngram`: N-gram size (default: 3)
- `sim_hamming_strict`: Strict Hamming distance threshold (default: 6)
- `sim_hamming_moderate`: Moderate Hamming distance threshold (default: 8)

## 3. Semantic Match Detection (Embeddings)

### Overview
Identifies sentences with similar meaning using sentence embeddings.

### Algorithm
- **Input**: Normalized sentence text
- **Process**:
  1. Generate sentence embeddings for each sentence using a pre-trained transformer-based model, such as `all-MiniLM-L6-v2` from the Sentence Transformers library (SBERT). The `all-MiniLM-L6-v2` model is specifically designed to be lightweight and efficient, making it capable of processing thousands of documents and tens of thousands of sentences on modern hardware. It can batch sentences for parallel processing, and its small memory footprint allows it to handle large corpora without requiring a GPU (though GPU acceleration will further speed up embedding generation).
  2. For every pair of sentences, compute the cosine similarity between their embedding vectors. Cosine similarity measures the angle between the vectors, indicating how similar their meanings are. For large numbers of sentences, efficient libraries (such as FAISS or PyTorch) can be used to accelerate similarity search and avoid computing all possible pairs.
  3. If the cosine similarity between two sentence embeddings exceeds the configured threshold (`embed_threshold_strict` is 0.8 by default, or `embed_threshold_moderate` is 0.7), classify the pair as a semantic match. Embedding vectors for all sentences are typically stored in memory (as a list or array) to enable efficient batch similarity computation.

  **Model Selection Rationale:**  
  The default embedding model used is `all-MiniLM-L6-v2` from the Sentence Transformers library. This model was chosen after evaluating several alternatives, including OpenAI embeddings (such as `text-embedding-ada-002`) and other transformer-based models. The key reasons for selecting `all-MiniLM-L6-v2` are:
  - **Performance:** It provides strong semantic similarity results in benchmark tests, with accuracy comparable to larger or commercial models.
  - **Efficiency:** The model is lightweight and fast, enabling processing of thousands of documents and tens of thousands of sentences on standard hardware, without requiring a GPU.
  - **Cost and Privacy:** Unlike OpenAI embeddings, `all-MiniLM-L6-v2` is open-source and can be run locally, avoiding API costs and data privacy concerns associated with sending data to external services.
  - **Batch Processing:** It supports efficient batch embedding, which is important for large-scale deduplication.
  - **Community Support:** It is widely used and well-maintained in the NLP community.

  FAISS is a powerful library for fast approximate nearest neighbor search, especially useful for very large datasets. However, for most deduplication scenarios involving thousands or tens of thousands of sentences, the default embedding model (`all-MiniLM-L6-v2`) combined with in-memory similarity search is efficient and simple to use, without the added complexity of setting up FAISS. FAISS becomes more advantageous when scaling to millions of sentences, where brute-force similarity search is no longer practical. For typical use cases, the overhead of integrating FAISS is not justified, but it remains an option for extremely large corpora to improve scalability and memory efficiency.
- **Output**: Pairs of semantically similar sentences with cosine similarity

### Use Case
- Detecting conceptually similar content
- Finding sentences with similar meaning

### Performance
- **Time Complexity**: O(n²)
- **Space Complexity**: O(n)

### Configuration
- `use_embeddings`: Enable semantic matching (default: false)
- `embed_model`: Pre-trained embedding model (default: 'all-MiniLM-L6-v2')
- `embed_threshold_strict`: Strict cosine similarity threshold (default: 0.8)
- `embed_threshold_moderate`: Moderate cosine similarity threshold (default: 0.7)

## Block Matching

### Overview
Identifies sequences of consecutive duplicate sentences.

### Algorithm
- **Input**: List of duplicate sentence pairs
- **Process**:
  1. Group consecutive duplicate sentences
  2. Identify matching blocks across documents
  3. Calculate block length and position
- **Output**: Matching blocks with start/end positions

### Use Case
- Detecting copied paragraphs
- Finding large duplicate sections

### Performance
- **Time Complexity**: O(n)
- **Space Complexity**: O(n)

### Configuration
- `block_min_run`: Minimum consecutive sentences for a block (default: 3)

## Implementation Details

### Backend
- **File**: `corpus_dedup_runner.py`
- **Main Class**: `DuplicateAnalyzer`
- **Output Formats**:
  - CSV files for each match type
  - JSON summary with statistics

### Frontend
- **Visualization**:
  - Color-coded highlights for different match types
  - Side-by-side comparison view
  - Similarity matrix visualization

## References
- [SimHash Paper](https://www.cs.princeton.edu/courses/archive/spring04/cos598B/bib/CharikarEstim.pdf)
- [Sentence Transformers](https://www.sbert.net/)
- [FAISS for Similarity Search](https://github.com/facebookresearch/faiss)