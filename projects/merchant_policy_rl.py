"""Offline contextual-bandit evaluation with synthetic commerce interactions.
Run: python projects/merchant_policy_rl.py
"""
import numpy as np

def softmax(x):
    a=np.exp(x-x.max(axis=1,keepdims=True))
    return a/a.sum(axis=1,keepdims=True)

def experiment(n=5000, seed=42):
    rng=np.random.default_rng(seed)
    features=rng.normal(size=(n,5))
    truth=rng.normal(size=(5,4))
    rewards=1/(1+np.exp(-(features@truth)))
    behavior=0.85*softmax(features@truth/2)+0.15/4
    logged=np.array([rng.choice(4,p=row) for row in behavior])
    observed=rng.binomial(1,rewards[np.arange(n),logged])
    cut=int(n*0.6)
    x_train=np.column_stack((np.ones(cut),features[:cut]))
    x_eval=np.column_stack((np.ones(n-cut),features[cut:]))
    weights=np.zeros((6,4))
    for a in range(4):
        idx=logged[:cut]==a
        weights[:,a]=np.linalg.solve(x_train[idx].T@x_train[idx]+2*np.eye(6),x_train[idx].T@observed[:cut][idx])
    q=np.clip(x_eval@weights,0,1)
    target=np.full(q.shape,0.025)
    target[np.arange(len(q)),q.argmax(axis=1)]+=0.9
    a=logged[cut:]
    importance=target[np.arange(len(a)),a]/behavior[cut:][np.arange(len(a)),a]
    ips=np.mean(importance*observed[cut:])
    dr=np.mean(np.sum(target*q,axis=1)+importance*(observed[cut:]-q[np.arange(len(a)),a]))
    oracle=np.mean(np.sum(target*rewards[cut:],axis=1))
    return dict(samples=n,seed=seed,ips=float(ips),doubly_robust=float(dr),synthetic_oracle=float(oracle))

if __name__=="__main__":
    import json
    print(json.dumps(experiment(),indent=2))
