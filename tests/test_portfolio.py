"""Smoke tests for the portfolio's synthetic, read-only demos."""
import numpy as np
from projects.merchant_policy_rl import experiment
from projects.flashserve_4bit import pack_int4, unpack_int4
from projects.catalog_retrieval import build_catalog, search
from projects.pr_review_assistant import review
from projects.test_impact_analyzer import impacted_tests
from projects.segmentation_lab import disk, dice, iou

def test_bandit_reproducible():
    assert experiment(n=400,seed=4)==experiment(n=400,seed=4)

def test_int4_packing_odd_width():
    weights=np.zeros((3,5),dtype=np.float32)
    packed,scale,width=pack_int4(weights)
    assert np.array_equal(weights,unpack_int4(packed,scale,width))

def test_retrieval_query():
    names,vectors=build_catalog()
    result=search("red shoes",names,vectors)
    assert len(result)==10

def test_code_review_never_posts():
    assert review("+print('hello')","old","new")["status"]=="stale"
    assert review("+print('hello')","a","a")["posted_comments"]==0

def test_segmentation():
    actual=disk()
    assert dice(actual,actual)==1.0
    assert iou(actual,actual)==1.0

from projects.catalog_retrieval import evaluate_query, query_vector
from pathlib import Path


def test_catalog_metrics_use_synthetic_ground_truth():
    names, vectors = build_catalog(seed=7)
    ranked = search("red shoes", names, vectors, k=10)
    result = evaluate_query("red shoes", names, ranked)
    assert result["relevant_items"] == 5
    assert 0.0 <= result["recall_at_k"] <= 1.0
    assert 0.0 <= result["reciprocal_rank"] <= 1.0


def test_catalog_rejects_invalid_queries():
    import pytest
    names, vectors = build_catalog()
    with pytest.raises(ValueError):
        search("unrecognized item", names, vectors)
    with pytest.raises(ValueError):
        search("red shoes", names, vectors, k=0)


def test_changed_untracked_file_selects_all_tests(tmp_path: Path):
    (tmp_path / "module.py").write_text("def f(): return 1\n")
    (tmp_path / "test_module.py").write_text("import module\n")
    result = impacted_tests(tmp_path, ["renamed_module.py"])
    assert result["fallback"] is True
    assert result["selected"] == ["test_module.py"]


def test_dynamic_imports_trigger_safe_fallback(tmp_path: Path):
    (tmp_path / "module.py").write_text("def f(): return 1\n")
    (tmp_path / "test_module.py").write_text("import importlib\nmodule = importlib.import_module('module')\n")
    result = impacted_tests(tmp_path, ["module.py"])
    assert result["fallback"] is True
    assert "test_module.py" in result["selected"]
