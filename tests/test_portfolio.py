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
