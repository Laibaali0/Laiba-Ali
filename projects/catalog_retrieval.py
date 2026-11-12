"""Deterministic product search using synthetic image/text attribute vectors.
Not a CLIP model; no real customer data.
Run: python projects/catalog_retrieval.py
"""
import numpy as np
CATEGORIES=("shoes","jacket","mug","bag")
COLORS=("red","blue","green","black")

def build_catalog(seed=42):
    rng=np.random.default_rng(seed)
    names,vectors=[],[]
    for i,c in enumerate(CATEGORIES):
        for j,color in enumerate(COLORS):
            for k in range(5):
                v=np.zeros(8)
                v[i]=v[4+j]=1.0
                names.append(f"{color} {c} {k}")
                vectors.append(v+rng.normal(0,.1,size=8))
    return names,np.array(vectors)

def search(text,names,vectors,k=10):
    query=np.zeros(8)
    for i,token in enumerate(CATEGORIES+COLORS):
        if token in text.lower().split():
            query[i]=1
    if not np.any(query):
        raise ValueError("Query requires a known color or category")
    scores=vectors@query/(np.linalg.norm(vectors,axis=1)*np.linalg.norm(query))
    ranked=np.argsort(-scores,kind="stable")[:k]
    return [names[i] for i in ranked]

if __name__=="__main__":
    names,vectors=build_catalog()
    matches=search("red shoes",names,vectors)
    print("Synthetic top matches for 'red shoes':",matches)
