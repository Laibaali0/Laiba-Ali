# ML Portfolio Roadmap

This is a **planning board in Markdown**, not a GitHub Projects board. The current repository contains runnable synthetic-data starter scripts. None of the planned experiments or benchmarks below should be described as completed until validated.

| Project | Status | Current demo | Next milestone |
|---|---|---|---|
| MerchantPolicy-RL | Starter | [Logged-bandit baseline](projects/merchant_policy_rl.py) | Offline policy evaluation on a reproducible public benchmark |
| FlashServe-4bit | Starter | [INT4 CPU quantization](projects/flashserve_4bit.py) | Public-model inference benchmark on a named GPU |
| Catalog Retrieval | Starter | [Synthetic multimodal retrieval](projects/catalog_retrieval.py) | CLIP/SigLIP embeddings on a licensed product dataset |
| PR Review Assistant | Starter | [Read-only commit freshness checker](projects/pr_review_assistant.py) | Read-only PR ingestion and human-reviewed reports |
| Test Impact Analyzer | Starter | [Static import graph](projects/test_impact_analyzer.py) | End-to-end CI test selection experiment |
| Segmentation Lab | Starter | [Synthetic Dice/IoU metrics](projects/segmentation_lab.py) | Patient-disjoint dataset evaluation and MONAI baseline |

## Implementation checklist

### MerchantPolicy-RL
- [ ] Document data source and licensing
- [ ] Separate training and evaluation sets
- [ ] Compare baseline and target policy across multiple seeds
- [ ] Estimate IPS/DR with uncertainty intervals
- [ ] Publish actual, reproducible outcomes

### FlashServe-4bit
- [ ] Add licensed, publicly available model weights
- [ ] Compare FP16/BF16 and quantized inference on matching hardware
- [ ] Measure peak memory, time-to-first-token, tokens/sec, and accuracy
- [ ] Record versions, accelerator, batch size, and reproducibility details

### Catalog Retrieval
- [ ] Add licensed image/text data
- [ ] Extract real CLIP/SigLIP embeddings
- [ ] Implement FAISS nearest-neighbor search and reranking
- [ ] Evaluate Recall@K and latency on held-out products

### PR Review Assistant
- [ ] Add authenticated read-only pull request access
- [ ] Verify latest commit before using review findings
- [ ] Add diff parser fixtures and false-positive cases
- [ ] Keep comments human-approved, never auto-post

### Test Impact Analyzer
- [ ] Handle relative imports and package structures
- [ ] Compare selected tests against full test suite
- [ ] Fall back to all tests if safety is uncertain
- [ ] Measure precision, recall, and saved CI time

### Segmentation Lab
- [ ] Use licensed public segmentation data
- [ ] Define patient-disjoint evaluation splits
- [ ] Add reproducible PyTorch/MONAI training
- [ ] Report Dice, IoU, variability, limitations

## GitHub Projects

To display a project board on [your profile's Projects tab](https://github.com/Laibaali0?tab=projects), create a new board from that tab, name it **Applied ML Portfolio**, and add items corresponding to these six project tracks. Use the statuses **Backlog**, **In progress**, and **Done**. Mark only finished, verifiable work as Done.

This roadmap is not an invitation to inflate contribution counts or claim unreproduced résumé metrics.
