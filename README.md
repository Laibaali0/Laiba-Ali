# Applied ML & Engineering — Project Portfolio

A growing collection of **small, reproducible engineering prototypes** exploring applied machine learning, evaluation, efficient inference, retrieval, and developer tooling.

> **Status: portfolio starters / learning demos.** These are not production systems, company projects, or reproductions of numerical results from a résumé. Datasets used here are synthetic; metrics are computed only when you run the demos. Some components illustrate a concept rather than implement a full research paper or industry system. No proprietary code is included.

## Project directory

| Project | What it demonstrates | Run |
| --- | --- | --- |
| [MerchantPolicy-RL](projects/merchant_policy_rl/README.md) | Logged-bandit data, contextual ranking, off-policy evaluation (IPS and doubly robust) | `python -m projects.merchant_policy_rl.demo` |
| [FlashServe-4bit](projects/flashserve_4bit/README.md) | 4-bit weight packing, per-row quantization, reconstruction and memory accounting | `python -m projects.flashserve_4bit.demo` |
| [Catalog Retrieval](projects/catalog_retrieval/README.md) | Synthetic multimodal feature alignment, cosine retrieval, deterministic evaluation | `python -m projects.catalog_retrieval.demo` |
| [PR Review Assistant](projects/pr_review_assistant/README.md) | Read-only diff analysis with a commit freshness guard | `python -m projects.pr_review_assistant.demo --demo` |
| [Test Impact Analyzer](projects/test_impact_analyzer/README.md) | Python AST import graph, conservative changed-file test selection | `python -m projects.test_impact_analyzer.demo --demo` |
| [Segmentation Research Tools](projects/segmentation_lab/README.md) | Synthetic mask generation, Dice/IoU evaluation, experiment metadata | `python -m projects.segmentation_lab.demo` |

## Quick start

```bash
git clone https://github.com/Laibaali0/Laiba-Ali.git
cd Laiba-Ali
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
python -m pip install -r requirements.txt
python -m pytest -q
python -m projects.merchant_policy_rl.demo
```

The baseline demos use NumPy and standard-library Python only, so they can run on a laptop without a GPU, cloud account, private dataset, or API key.

## Next steps

- Add real public datasets and document licenses, provenance, train/test splits, and limitations.
- Integrate real model training and validate results against a reproducible baseline before reporting numbers.
- Add performance profiles for a stated accelerator and hardware configuration.
- Turn each starter into a separate repository if it grows beyond a small prototype.

**Important:** Please do not describe a demo as deployed at Shopify, GitHub, Tesla, or another employer. Personal portfolio code and professional contributions should be distinguished clearly.
