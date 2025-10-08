
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Corpus near-duplicate & reuse detector for .docx files.

Outputs:
- exact_sentence_pairs.csv
- simhash_sentence_pairs.csv
- embed_sentence_pairs.csv (if --use_embeddings)
- block_matches.csv (merged consecutive sentence matches)
- doc_metrics.csv (per-doc metrics)
- summary.json

Usage (examples):
  pip install python-docx pandas numpy tqdm faiss-cpu sentence-transformers
  python corpus_dedup_runner.py --input_dir /path/to/docx --out_dir ./out --use_embeddings
  # SimHash only:
  python corpus_dedup_runner.py --input_dir /path/to/docx --out_dir ./out

Notes:
- Embeddings are optional. If not installed or --use_embeddings not passed, the embeddings stage is skipped.
- SimHash here is implemented without external deps (64-bit, n-gram features).
"""

import argparse, re, json, math, hashlib
from dataclasses import dataclass
from itertools import combinations
from pathlib import Path
from zipfile import ZipFile
from collections import defaultdict, Counter
from typing import List, Tuple, Dict, Iterable
import numpy as np
import pandas as pd
from tqdm import tqdm

# ----------------------------- Text IO -----------------------------

def read_docx_text(path: Path) -> str:
    """Extract visible text from a .docx by parsing word/document.xml"""
    with ZipFile(path) as z:
        with z.open("word/document.xml") as f:
            xml = f.read().decode("utf-8", errors="ignore")
    # Very lenient parse without heavy XML deps
    # Pull text inside <w:t>...</w:t>
    out = []
    for m in re.finditer(r"<w:t[^>]*>(.*?)</w:t>", xml, flags=re.S|re.I):
        out.append(re.sub(r"\s+", " ", m.group(1)))
    return "\n".join(out)

def normalize_sentence(s: str) -> str:
    s = s.lower()
    s = s.replace("\u2018","'").replace("\u2019","'").replace("\u201c",'"').replace("\u201d",'"')
    s = re.sub(r"\s+", " ", s).strip()
    return s

def sentence_split(text: str) -> List[str]:
    """Naive sentence split with extra break for overly long lines."""
    t = re.sub(r"[\r\n]+", " ", text)
    parts = re.split(r"(?<=[\.\!\?\:;])\s+", t)
    out = []
    for p in parts:
        p = p.strip()
        if not p:
            continue
        toks = p.split()
        if len(toks) > 80:
            for i in range(0, len(toks), 30):
                out.append(" ".join(toks[i:i+30]))
        else:
            out.append(p)
    return out

# ----------------------------- SimHash -----------------------------

def md5_64(s: str) -> int:
    h = hashlib.md5(s.encode("utf-8")).digest()
    return int.from_bytes(h[:8], "big", signed=False)

def tokenize_words(s: str) -> List[str]:
    return re.findall(r"[a-z0-9]+", s.lower())

def simhash_64(text: str, ngram: int = 3) -> int:
    toks = tokenize_words(text)
    feats = toks if len(toks) < ngram else [" ".join(toks[i:i+ngram]) for i in range(len(toks)-ngram+1)]
    counts = Counter(feats)
    V = [0]*64
    for feat, w in counts.items():
        hv = md5_64(feat)
        for i in range(64):
            if (hv >> i) & 1:
                V[i] += w
            else:
                V[i] -= w
    sig = 0
    for i in range(64):
        if V[i] >= 0:
            sig |= (1<<i)
    return sig

def hamming(a: int, b: int) -> int:
    return (a ^ b).bit_count()

def bands_64(sig: int, bands=8, width=8) -> Iterable[Tuple[int,int]]:
    for i in range(bands):
        yield (i, (sig >> (i*width)) & ((1<<width)-1))

# ----------------------------- Embeddings (optional) -----------------------------

def embed_sentences(sentences: List[str], model_name: str):
    """Return L2-normalized embeddings using sentence-transformers; falls back if unavailable."""
    try:
        from sentence_transformers import SentenceTransformer
    except Exception as e:
        raise RuntimeError("sentence-transformers not installed") from e
    model = SentenceTransformer(model_name)
    vecs = model.encode(sentences, convert_to_numpy=True, normalize_embeddings=True)
    return vecs

def build_faiss_index(vecs: np.ndarray):
    try:
        import faiss
    except Exception as e:
        raise RuntimeError("faiss-cpu not installed") from e
    idx = faiss.IndexFlatIP(vecs.shape[1])  # cosine since normalized
    idx.add(vecs)
    return idx

# ----------------------------- Data Classes -----------------------------

@dataclass
class SentItem:
    gid: int          # global sentence id
    doc_id: int
    doc_path: Path
    sent_id: int
    raw: str
    norm: str
    sig: int

# ----------------------------- Runner -----------------------------

def run(args):
    in_dir = Path(args.input_dir)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # 1) Load docs
    doc_paths = sorted([p for p in in_dir.rglob("*.docx") if p.is_file()])
    if not doc_paths:
        print("No .docx files found.")
        return

    # 2) Extract sentences
    all_items: List[SentItem] = []
    total_tokens = []
    gid = 0
    for doc_id, p in enumerate(tqdm(doc_paths, desc="Reading DOCX")):
        text = read_docx_text(p)
        sents = sentence_split(text)
        for sid, s in enumerate(sents):
            norm = normalize_sentence(s)
            # filter short sentences
            if len(tokenize_words(norm)) < args.min_sentence_words:
                continue
            sig = simhash_64(norm, ngram=args.sim_ngram)
            all_items.append(SentItem(gid, doc_id, p, sid, s, norm, sig))
            gid += 1
        total_tokens.append(sum(len(tokenize_words(s)) for s in sents))

    n_sent = len(all_items)
    print(f"Total sentences kept (>= {args.min_sentence_words} words): {n_sent}")

    # Build per-doc sentence counts
    doc_n_sent = Counter([it.doc_id for it in all_items])

    # 3) Exact sentence index
    by_norm: Dict[str, List[int]] = defaultdict(list)
    for idx, it in enumerate(all_items):
        by_norm[it.norm].append(idx)

    exact_pairs = set()
    for norm, idxs in by_norm.items():
        # cross-doc pairs only
        if len(idxs) < 2:
            continue
        # group by doc
        doc_groups = defaultdict(list)
        for i in idxs:
            doc_groups[all_items[i].doc_id].append(i)
        docs = sorted(doc_groups.keys())
        if len(docs) < 2:
            continue
        # make combinations across different docs
        for da, db in combinations(docs, 2):
            for ia in doc_groups[da]:
                for ib in doc_groups[db]:
                    a, b = (ia, ib) if ia < ib else (ib, ia)
                    exact_pairs.add((a, b))

    # 4) SimHash + LSH
    buckets = defaultdict(list)
    for idx, it in enumerate(all_items):
        for key in bands_64(it.sig, bands=8, width=8):
            buckets[key].append(idx)

    sim_pairs = []  # (a,b,ham)
    seen = set()
    for _, idxs in buckets.items():
        L = len(idxs)
        if L > 1:
            for i in range(L):
                ia = idxs[i]; A = all_items[ia]
                for j in range(i+1, L):
                    ib = idxs[j]; B = all_items[ib]
                    if A.doc_id == B.doc_id:
                        continue
                    a, b = (ia, ib) if ia < ib else (ib, ia)
                    if (a,b) in seen:
                        continue
                    ham = hamming(all_items[a].sig, all_items[b].sig)
                    if ham <= args.sim_hamming_moderate:
                        seen.add((a,b))
                        sim_pairs.append((a,b,ham))

    # 5) Embeddings (optional)
    embed_pairs = []  # (a,b,cosine)
    if args.use_embeddings:
        try:
            sents = [it.norm for it in all_items]
            vecs = embed_sentences(sents, args.embed_model)
            idx = build_faiss_index(vecs)
            import faiss
            D, I = idx.search(vecs, args.topk)
            for i in range(n_sent):
                A = all_items[i]
                for j_idx, sim in zip(I[i][1:], D[i][1:]):
                    if j_idx < 0: 
                        continue
                    B = all_items[j_idx]
                    if A.doc_id == B.doc_id:
                        continue
                    if sim >= args.embed_threshold_moderate:
                        a, b = (i, int(j_idx)) if i < j_idx else (int(j_idx), i)
                        embed_pairs.append((a,b,float(sim)))
            # dedupe keep max sim
            tmp = {}
            for a,b,s in embed_pairs:
                tmp[(a,b)] = max(s, tmp.get((a,b), 0.0))
            embed_pairs = [(a,b,s) for (a,b),s in tmp.items()]
        except Exception as e:
            print(f"[WARN] Embeddings skipped: {e}")

    # 6) Write sentence-level pairs
    def write_exact():
        rows = []
        for a,b in sorted(exact_pairs):
            A = all_items[a]; B = all_items[b]
            rows.append({"docA": A.doc_path.name, "sentA_id": A.sent_id, "textA": A.raw[:240],
                         "docB": B.doc_path.name, "sentB_id": B.sent_id, "textB": B.raw[:240]})
        df = pd.DataFrame(rows)
        df.to_csv(out_dir / "exact_sentence_pairs.csv", index=False)
        return df

    def write_simhash():
        rows_strict, rows_moderate = [], []
        for a,b,ham in sorted(sim_pairs, key=lambda x: (x[2], all_items[x[0]].doc_id, all_items[x[1]].doc_id)):
            A = all_items[a]; B = all_items[b]
            row = {"docA": A.doc_path.name, "sentA_id": A.sent_id, "textA": A.raw[:240],
                   "docB": B.doc_path.name, "sentB_id": B.sent_id, "textB": B.raw[:240], "hamming": ham}
            if ham <= args.sim_hamming_strict:
                rows_strict.append(row)
            rows_moderate.append(row)
        pd.DataFrame(rows_strict).to_csv(out_dir / "simhash_sentence_pairs_strict.csv", index=False)
        pd.DataFrame(rows_moderate).to_csv(out_dir / "simhash_sentence_pairs.csv", index=False)
        return len(rows_strict), len(rows_moderate)

    def write_embeddings():
        if not embed_pairs:
            pd.DataFrame(columns=["docA","sentA_id","textA","docB","sentB_id","textB","cosine"]).to_csv(out_dir / "embed_sentence_pairs.csv", index=False)
            return 0,0
        rows_strict, rows_moderate = [], []
        for a,b,s in sorted(embed_pairs, key=lambda x: (-x[2], all_items[x[0]].doc_id, all_items[x[1]].doc_id)):
            A = all_items[a]; B = all_items[b]
            row = {"docA": A.doc_path.name, "sentA_id": A.sent_id, "textA": A.raw[:240],
                   "docB": B.doc_path.name, "sentB_id": B.sent_id, "textB": B.raw[:240], "cosine": round(s,4)}
            if s >= args.embed_threshold_strict:
                rows_strict.append(row)
            if s >= args.embed_threshold_moderate:
                rows_moderate.append(row)
        pd.DataFrame(rows_strict).to_csv(out_dir / "embed_sentence_pairs_strict.csv", index=False)
        pd.DataFrame(rows_moderate).to_csv(out_dir / "embed_sentence_pairs.csv", index=False)
        return len(rows_strict), len(rows_moderate)

    exact_df = write_exact()
    n_sim_strict, n_sim_mod = write_simhash()
    n_emb_strict, n_emb_mod = write_embeddings()

    # 7) Merge into blocks (adjacent sentences aligned)
    # Collect matches as (docA, sentA, docB, sentB)
    edges = defaultdict(set)  # (docA, docB) -> set of (sentA, sentB)
    def add_edge(a, b):
        A = all_items[a]; B = all_items[b]
        da, db = A.doc_id, B.doc_id
        if da == db: return
        if da > db:
            da, db = db, da
            A, B = B, A
        edges[(da,db)].add((A.sent_id, B.sent_id))

    for a,b in exact_pairs: add_edge(a,b)
    for a,b,_ in sim_pairs: 
        if _ <= args.sim_hamming_moderate: add_edge(a,b)
    for a,b,_ in embed_pairs: add_edge(a,b)

    block_rows = []
    per_doc_dup_sent = defaultdict(set)  # doc_id -> set(sent_id) that participate in any block/sentence match
    for (da, db), pairs in edges.items():
        # Build map from sentA to list of sentB
        pts = sorted(pairs)
        # Sort by sentA then sentB and greedily merge runs where both increment by 1
        pts.sort()
        i = 0
        while i < len(pts):
            a0, b0 = pts[i]
            a1, b1 = a0, b0
            j = i + 1
            while j < len(pts) and pts[j][0] == a1 + 1 and pts[j][1] == b1 + 1:
                a1, b1 = pts[j]
                j += 1
            run_len = (a1 - a0 + 1)
            if run_len >= args.block_min_run:
                docA = doc_paths[da].name
                docB = doc_paths[db].name
                block_rows.append({
                    "docA": docA, "A_start": a0, "A_end": a1, "len_sent": run_len,
                    "docB": docB, "B_start": b0, "B_end": b1
                })
                # mark sentences as duplicated
                for s in range(a0, a1+1):
                    per_doc_dup_sent[da].add(s)
                for s in range(b0, b1+1):
                    per_doc_dup_sent[db].add(s)
            i = j

    pd.DataFrame(block_rows).to_csv(out_dir / "block_matches.csv", index=False)

    # 8) Per-doc metrics
    metrics = []
    # build fast lookups for sentence-level hits (any match)
    matched_sent_ids_by_doc = defaultdict(set)
    def mark_pair(a,b):
        A=all_items[a]; B=all_items[b]
        matched_sent_ids_by_doc[A.doc_id].add(A.sent_id)
        matched_sent_ids_by_doc[B.doc_id].add(B.sent_id)

    for a,b in exact_pairs: mark_pair(a,b)
    for a,b,_ in sim_pairs: mark_pair(a,b)
    for a,b,_ in embed_pairs: mark_pair(a,b)

    for doc_id, p in enumerate(doc_paths):
        n_total = sum(1 for it in all_items if it.doc_id == doc_id)
        n_matched = len(matched_sent_ids_by_doc.get(doc_id, set()))
        n_block = len(per_doc_dup_sent.get(doc_id, set()))
        metrics.append({
            "doc": p.name,
            "total_sentences": n_total,
            "matched_sentences_any": n_matched,
            "matched_sentences_pct": round(100.0 * n_matched / n_total, 2) if n_total else 0.0,
            "in_block_sentences": n_block,
            "in_block_sentences_pct": round(100.0 * n_block / n_total, 2) if n_total else 0.0,
        })
    pd.DataFrame(metrics).to_csv(out_dir / "doc_metrics.csv", index=False)

    # 9) Summary
    summary = {
        "n_documents": len(doc_paths),
        "n_sentences_kept": n_sent,
        "exact_pairs": len(exact_pairs),
        "simhash_pairs_moderate": n_sim_mod,
        "simhash_pairs_strict": n_sim_strict,
        "embed_pairs_moderate": n_emb_mod,
        "embed_pairs_strict": n_emb_strict,
        "block_matches": len(block_rows),
        "params": vars(args),
        "docs": [p.name for p in doc_paths],
    }
    (out_dir / "summary.json").write_text(json.dumps(summary, indent=2))

def build_argparser():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input_dir", required=True)
    ap.add_argument("--out_dir", required=True)
    ap.add_argument("--min_sentence_words", type=int, default=8)
    ap.add_argument("--sim_ngram", type=int, default=3)
    ap.add_argument("--sim_hamming_strict", type=int, default=6)
    ap.add_argument("--sim_hamming_moderate", type=int, default=8)
    ap.add_argument("--use_embeddings", action="store_true")
    ap.add_argument("--embed_model", default="sentence-transformers/all-MiniLM-L6-v2")
    ap.add_argument("--embed_threshold_strict", type=float, default=0.90)
    ap.add_argument("--embed_threshold_moderate", type=float, default=0.88)
    ap.add_argument("--topk", type=int, default=8)
    ap.add_argument("--block_min_run", type=int, default=2)
    return ap

if __name__ == "__main__":
    parser = build_argparser()
    run(parser.parse_args())
