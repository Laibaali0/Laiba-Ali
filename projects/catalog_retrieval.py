"""Small retrieval experiment using synthetic product attribute vectors.

No product images or pretrained CLIP weights are used. Metrics describe only
this generated fixture, not a real-world retrieval benchmark.

Run: python -m projects.catalog_retrieval --query "red shoes" --k 10
"""
import argparse
import json

import numpy as np

CATEGORIES = ("shoes", "jacket", "mug", "bag")
COLORS = ("red", "blue", "green", "black")


def build_catalog(seed=42):
    """Return stable item names and noisy vectors for each color/category pair."""
    rng = np.random.default_rng(seed)
    names, vectors = [], []
    for category_index, category in enumerate(CATEGORIES):
        for color_index, color in enumerate(COLORS):
            for item_index in range(5):
                vector = np.zeros(8)
                vector[category_index] = 1
                vector[4 + color_index] = 1
                names.append(f"{color} {category} {item_index}")
                vectors.append(vector + rng.normal(0, 0.1, size=8))
    return names, np.asarray(vectors)


def query_vector(text):
    tokens = set(text.lower().split())
    query = np.zeros(8)
    for index, token in enumerate(CATEGORIES + COLORS):
        if token in tokens:
            query[index] = 1
    if not np.any(query):
        raise ValueError("Query needs a known category or color")
    return query


def search(text, names, vectors, k=10):
    """Return the k closest item names by cosine similarity."""
    if not 1 <= k <= len(names):
        raise ValueError("k must be between 1 and catalog size")
    if vectors.shape[0] != len(names):
        raise ValueError("Item names and vectors must have matching lengths")
    query = query_vector(text)
    norm = np.linalg.norm(vectors, axis=1) * np.linalg.norm(query)
    scores = (vectors @ query) / np.maximum(norm, 1e-12)
    ranked = np.argsort(-scores, kind="stable")[:k]
    return [names[index] for index in ranked]


def evaluate_query(text, names, ranked):
    """Recall@k and reciprocal rank against synthetic attribute matches.

    Only query tokens recognized by the generated vocabulary are counted.
    The ground truth is entirely synthetic and deterministic.
    """
    tokens = set(text.lower().split()) & set(CATEGORIES + COLORS)
    if not tokens:
        raise ValueError("No recognized query attributes")
    relevant = {name for name in names if tokens.issubset(name.split())}
    if not relevant:
        return {"recall_at_k": 0.0, "reciprocal_rank": 0.0, "relevant_items": 0}
    hits = [index + 1 for index, name in enumerate(ranked) if name in relevant]
    return {
        "recall_at_k": len(hits) / len(relevant),
        "reciprocal_rank": 1.0 / hits[0] if hits else 0.0,
        "relevant_items": len(relevant),
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--query", default="red shoes")
    parser.add_argument("--k", type=int, default=10)
    parser.add_argument("--seed", type=int, default=42)
    arguments = parser.parse_args()

    names, vectors = build_catalog(seed=arguments.seed)
    results = search(arguments.query, names, vectors, k=arguments.k)
    print(json.dumps({
        "query": arguments.query, "top_k": results,
        "evaluation": evaluate_query(arguments.query, names, results),
        "synthetic_data": True,
        "seed": arguments.seed,
    }, indent=2))
