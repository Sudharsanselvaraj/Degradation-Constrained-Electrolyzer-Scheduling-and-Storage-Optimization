"""
API Routes for 5-Baseline Head-to-Head Benchmarks and Ablation Studies.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Optional

from backend.app.experiments.ablation_runner import AblationStudyRunner
from backend.app.experiments.benchmark_runner import BenchmarkRunner

router = APIRouter(prefix="/api/experiments", tags=["experiments"])

_benchmark_runner = BenchmarkRunner()
_ablation_runner = AblationStudyRunner(_benchmark_runner)


class BenchmarkRunRequest(BaseModel):
    initial_health_mean: float = 0.92
    initial_health_std: float = 0.05
    horizon_steps: int = 96


@router.post("/compare")
def compare_all_baselines(req: BenchmarkRunRequest):
    """Execute head-to-head empirical comparison of all 5 competing baselines."""
    runner = BenchmarkRunner(horizon_steps=req.horizon_steps)
    res = runner.run_benchmark(
        initial_health_mean=req.initial_health_mean,
        initial_health_std=req.initial_health_std,
    )
    return res


@router.post("/ablations")
def run_ablation_experiments(req: BenchmarkRunRequest):
    """Run systematic ablation experiments (A through F)."""
    runner = BenchmarkRunner(horizon_steps=req.horizon_steps)
    ablation = AblationStudyRunner(runner)
    res = ablation.run_all_ablations(
        initial_health_mean=req.initial_health_mean,
        initial_health_std=req.initial_health_std,
    )
    return res
