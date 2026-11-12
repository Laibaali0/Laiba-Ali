# Applied ML & Engineering — Portfolio Starters

Practical, **synthetic-data projects** for exploring model evaluation, efficient inference, retrieval, and developer tooling.

> **Work in progress / educational demos.** These projects are small experiments, not deployed production systems, published research, or evidence of the numerical results listed on a résumé. No Shopify, GitHub, Tesla, Wealthsimple, or other employer code or confidential data is included.

## Explore the projects

| Project | What it demonstrates | Run |
|---|---|---|
| [MerchantPolicy-RL](projects/merchant_policy_rl.py) | Contextual bandits, logged propensities, IPS and doubly robust policy evaluation | `python -m projects.merchant_policy_rl` |
| [FlashServe-4bit](projects/flashserve_4bit.py) | Per-row INT4 weight quantization, nibble packing, reconstruction error | `python -m projects.flashserve_4bit` |
| [Catalog Retrieval](projects/catalog_retrieval.py) | Synthetic image/text feature retrieval with cosine similarity | `python -m projects.catalog_retrieval` |
| [PR Review Assistant](projects/pr_review_assistant.py) | Read-only diff checks and stale-commit validation | `python -m projects.pr_review_assistant` |
| [Test Impact Analyzer](projects/test_impact_analyzer.py) | Python AST dependency mapping and conservative test selection | `python -m projects.test_impact_analyzer` |
| [Segmentation Lab](projects/segmentation_lab.py) | Synthetic mask evaluation with Dice and IoU | `python -m projects.segmentation_lab` |

## Quick start

```bash
git clone https://github.com/Laibaali0/Laiba-Ali.git
cd Laiba-Ali
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
python -m pip install -r requirements.txt
python -m pytest -q
python -m projects.merchant_policy_rl
```

These examples use synthetic data, NumPy, and the Python standard library. A GPU, commercial API, or private dataset is not needed.

## Trying the evaluation tools

The retrieval demo now accepts a query, a top-k cutoff, and a random seed. It also prints a small evaluation summary based on synthetic ground-truth attributes:

```bash
python -m projects.catalog_retrieval --query "blue bag" --k 10 --seed 7
```

The test-impact demo uses a conservative fallback: when it encounters a changed file it does not recognize, or a dynamic/relative import it cannot safely analyze, it recommends the full test suite rather than silently skipping potentially relevant tests.

```bash
python -m projects.test_impact_analyzer
python -m pytest -q
```

**What the numbers mean:** retrieval recall and reciprocal rank only describe generated attribute vectors. These are not model accuracy results from CLIP, production search, or real customer queries.

## What I want to explore next

- Replace the synthetic attributes in Catalog Retrieval with a licensed public dataset and real CLIP embeddings.
- Compare quantization schemes and report task accuracy, hardware, actual GPU latency, and throughput.
- Evaluate contextual policies against stronger baselines with reproducible train/evaluation splits.
- Add configuration, test fixtures, clear limitations, and examples for each project.

**Portfolio integrity:** Generated results are only example outputs. This repository does not claim benchmark numbers from a résumé, production deployment, work at any employer, or authorship of confidential projects.
