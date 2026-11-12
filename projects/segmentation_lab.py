"""Synthetic-mask Dice / IoU evaluation, not a clinical model.
Run: python projects/segmentation_lab.py
"""
import numpy as np
def disk(size=64,center=(32,32),radius=14):
    y,x=np.ogrid[:size,:size]
    return (x-center[0])**2+(y-center[1])**2<=radius**2

def dice(a,b):
    a=np.asarray(a,bool);b=np.asarray(b,bool)
    if a.shape!=b.shape:raise ValueError("Shapes differ")
    total=a.sum()+b.sum()
    return float(2*np.logical_and(a,b).sum()/total) if total else 1.0

def iou(a,b):
    a=np.asarray(a,bool);b=np.asarray(b,bool)
    if a.shape!=b.shape:raise ValueError("Shapes differ")
    union=np.logical_or(a,b).sum()
    return float(np.logical_and(a,b).sum()/union) if union else 1.0

if __name__=="__main__":
    rng=np.random.default_rng(42)
    results=[]
    for _ in range(20):
        cx=int(rng.integers(20,44));cy=int(rng.integers(20,44))
        actual=disk(center=(cx,cy))
        predicted=disk(center=(cx+int(rng.integers(-3,4)),cy+int(rng.integers(-3,4))))
        results.append((dice(actual,predicted),iou(actual,predicted)))
    print({"synthetic_masks":20,"mean_dice":np.mean(results,axis=0)[0],"mean_iou":np.mean(results,axis=0)[1]})
