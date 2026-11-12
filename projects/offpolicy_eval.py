"""Off-policy evaluation helpers for discrete-action logged bandit data.

These estimators require known, non-zero logging propensities and a target
policy that only assigns probability to actions with logging support.
Confidence intervals are illustrative percentile bootstrap intervals and
do not correct for dependence between user sessions.

Run the contextual-bandit demo from the repository root:
    python -m projects.merchant_policy_rl
"""
import numpy as np


def _as_vector(name, values, size=None):
    values = np.asarray(values, dtype=np.float64)
    if values.ndim != 1 or len(values) == 0:
        raise ValueError(f"{name} must be a non-empty vector")
    if size is not None and len(values) != size:
        raise ValueError(f"{name} has inconsistent length")
    if not np.all(np.isfinite(values)):
        raise ValueError(f"{name} contains non-finite values")
    return values


def estimates(rewards, logging_probs, target_probs, q_logged=None, q_target=None):
    """Compute IPS, self-normalized IPS and optionally doubly robust (DR).

    q_logged is the estimated reward for each logged action.
    q_target is the expected estimated reward under the target policy.
    """
    rewards = _as_vector("rewards", rewards)
    logging_probs = _as_vector("logging_probs", logging_probs, len(rewards))
    target_probs = _as_vector("target_probs", target_probs, len(rewards))
    if np.any(logging_probs <= 0) or np.any(logging_probs > 1):
        raise ValueError("logging_probs must lie in (0, 1]")
    if np.any(target_probs < 0) or np.any(target_probs > 1):
        raise ValueError("target_probs must lie in [0, 1]")

    weights = target_probs / logging_probs
    total_weight = weights.sum()
    result = {
        "ips": float(np.mean(weights * rewards)),
        "snips": float(np.sum(weights * rewards) / total_weight) if total_weight > 0 else float("nan"),
        "effective_sample_size": float(total_weight**2 / np.square(weights).sum()) if np.any(weights) else 0.0,
        "samples": len(rewards),
    }
    if (q_logged is None) != (q_target is None):
        raise ValueError("DR requires both q_logged and q_target")
    if q_logged is not None:
        q_logged = _as_vector("q_logged", q_logged, len(rewards))
        q_target = _as_vector("q_target", q_target, len(rewards))
        result["doubly_robust"] = float(np.mean(q_target + weights * (rewards - q_logged)))
    return result


def bootstrap_interval(values, confidence=0.95, resamples=500, seed=42):
    """Bootstrap a mean with a deterministic RNG.

    For a production analysis, resample at the independent unit (for
    example, user/session), not individual correlated interactions.
    """
    values = _as_vector("values", values)
    if not 0 < confidence < 1:
        raise ValueError("confidence must be between 0 and 1")
    if resamples < 2:
        raise ValueError("resamples must be at least 2")
    rng = np.random.default_rng(seed)
    draws = rng.choice(values, size=(resamples, len(values)), replace=True).mean(axis=1)
    alpha = (1 - confidence) / 2
    bounds = np.quantile(draws, [alpha, 1 - alpha])
    return tuple(float(bound) for bound in bounds)
