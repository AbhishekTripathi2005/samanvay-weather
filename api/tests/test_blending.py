"""
Unit Tests for SAMANVAY Blending Mathematics & Statistical Verification.
Enforces:
1. Weights are strictly non-negative and sum to 1.0
2. Blended forecast stays within valid physical bounds
3. NNLS stacking never performs worse than the best individual model on training fit
4. Laplacian spatial neighbor smoothing preserves total sum to 1.0 and non-negativity
5. Quantile mapping preserves heavy tail extremes
6. Multi-hazard alert level transitions cleanly
7. DUAL BENCHMARK ASSERTION:
   - Blend beats every single individual model on 3-year national average
   - AND Blend honestly loses to at least one individual model on a specific regime/slice
     (e.g., ECMWF-IFS beats blend on Day 1 temperature). Real operational blending is honest!
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import unittest
import numpy as np

from blend.engine import (
    bias_correct_quantile,
    bias_correct_linear,
    skill_table,
    exp_decay_weights,
    inverse_skill_weights,
    nnls_stack,
    smooth_weights,
    equal_weights,
    blend,
    exceedance_prob,
    alert_level,
    verify,
    BlendingEngine,
    MODELS_LIST
)
from synth.engine import SyntheticEngine
from synth.regimes import detect_regime, REGIME_NAMES
from impact.shimla import evaluate_shimla_impact


class TestBlendingEngine(unittest.TestCase):
    def setUp(self):
        self.synth = SyntheticEngine.get_instance()

    def test_weights_non_negative_and_sum_to_one(self):
        """Weights must be >= 0 and sum to exactly 1.0 across all leads and regimes."""
        for lead in [24, 48, 72, 120, 168, 240]:
            for regime in REGIME_NAMES:
                for var in ["rainfall", "tmax", "wind_speed"]:
                    weights = BlendingEngine.compute_weights(lead=lead, regime=regime, variable=var)
                    self.assertEqual(len(weights), 7)
                    for m, w in weights.items():
                        self.assertGreaterEqual(w, 0.0, f"Model {m} weight negative")
                        self.assertLessEqual(w, 1.0, f"Model {m} weight exceeds 1")
                    total = sum(weights.values())
                    self.assertAlmostEqual(total, 1.0, places=3, msg=f"Weights do not sum to 1 for lead={lead}, reg={regime}")

    def test_equal_weights_baseline(self):
        eq = equal_weights()
        self.assertEqual(len(eq), 7)
        self.assertAlmostEqual(sum(eq.values()), 1.0, places=3)
        for w in eq.values():
            self.assertAlmostEqual(w, 1.0 / 7.0, delta=0.01)

    def test_inverse_skill_weights(self):
        skills = {"m1": 10.0, "m2": 5.0, "m3": 20.0}
        w = inverse_skill_weights(skills, temperature=0.7)
        self.assertEqual(len(w), 3)
        self.assertAlmostEqual(sum(w.values()), 1.0, places=3)
        # Lower error model m2 must have highest weight
        self.assertGreater(w["m2"], w["m1"])
        self.assertGreater(w["m1"], w["m3"])

    def test_exp_decay_weights(self):
        history = np.ones(30)
        w = exp_decay_weights(history, half_life_days=14)
        self.assertEqual(len(w), 30)
        self.assertAlmostEqual(float(np.sum(w)), 1.0, places=3)
        # Day 0 (most recent) must have higher weight than Day 29
        self.assertGreater(w[0], w[-1])

    def test_laplacian_smoothing_preserves_sum_and_bounds(self):
        """Spatial Laplacian smoothing preserves sum = 1 and non-negativity."""
        raw_weights = {
            "dist_A": {"m1": 0.8, "m2": 0.1, "m3": 0.1},
            "dist_B": {"m1": 0.2, "m2": 0.6, "m3": 0.2},
            "dist_C": {"m1": 0.1, "m2": 0.2, "m3": 0.7}
        }
        adj = {
            "dist_A": ["dist_B"],
            "dist_B": ["dist_A", "dist_C"],
            "dist_C": ["dist_B"]
        }
        smoothed = smooth_weights(raw_weights, adj_matrix=adj, laplacian_lambda=0.20)
        for dist, w_dict in smoothed.items():
            self.assertAlmostEqual(sum(w_dict.values()), 1.0, places=3)
            for m, val in w_dict.items():
                self.assertGreaterEqual(val, 0.0)
                self.assertLessEqual(val, 1.0)
        # Distance between dist_A and dist_B should shrink after smoothing
        diff_before = abs(raw_weights["dist_A"]["m1"] - raw_weights["dist_B"]["m1"])
        diff_after = abs(smoothed["dist_A"]["m1"] - smoothed["dist_B"]["m1"])
        self.assertLess(diff_after, diff_before)

    def test_nnls_stacking_never_worse_than_best_single(self):
        """NNLS stacking on training sample produces RMSE <= best single model."""
        rng = np.random.default_rng(42)
        n = 200
        y = rng.gamma(2.0, 10.0, size=n)
        # Create 3 noisy forecasts
        f1 = y + rng.normal(0, 5.0, size=n)
        f2 = y * 0.9 + rng.normal(2, 4.0, size=n)
        f3 = y * 1.1 + rng.normal(-1, 6.0, size=n)
        X = np.column_stack([f1, f2, f3])

        w = nnls_stack(X, y)
        self.assertEqual(len(w), 3)
        self.assertAlmostEqual(float(np.sum(w)), 1.0, places=3)
        self.assertTrue(np.all(w >= 0.0))

        stacked_pred = X @ w
        rmse_stack = np.sqrt(np.mean((stacked_pred - y) ** 2))
        rmse_singles = [np.sqrt(np.mean((X[:, i] - y) ** 2)) for i in range(3)]
        best_single_rmse = min(rmse_singles)

        # NNLS stacked RMSE should be less than or equal to best single (allow tiny numerical margin)
        self.assertLessEqual(rmse_stack, best_single_rmse + 1e-3)

    def test_quantile_mapping_tail_preservation(self):
        """EQM preserves upper tail extremes and does not flatline."""
        rng = np.random.default_rng(99)
        obs = rng.gamma(1.5, 12.0, size=500)
        # AI model with underestimation in the tail
        fcst = obs * 0.75 + rng.normal(0, 2.0, size=500)
        fcst = np.maximum(0, fcst)

        extreme_val = np.percentile(fcst, 98) + 30.0  # very extreme event
        corrected = bias_correct_quantile(fcst, obs, target_fcst=np.array([extreme_val]))
        # Corrected extreme value must be substantially greater than input (re-inflated tail)
        self.assertGreater(corrected[0], extreme_val)
        self.assertGreaterEqual(corrected[0], 0.0)

    def test_skill_table_comprehensive_metrics(self):
        """Skill table returns all 10 required operational verification metrics."""
        obs = np.array([5.0, 15.0, 70.0, 120.0, 2.0, 85.0, 0.0, 45.0])
        fcst = {"model_a": np.array([4.0, 18.0, 65.0, 110.0, 1.0, 90.0, 0.0, 40.0])}
        metrics = skill_table(fcst, obs, threshold=64.5)
        self.assertIn("model_a", metrics)
        m = metrics["model_a"]
        for key in ["rmse", "mae", "bias", "corr", "crps", "pod", "far", "csi", "ets", "sedi"]:
            self.assertIn(key, m, f"Metric {key} missing from scorecard")
            self.assertIsInstance(m[key], float)

    def test_alert_level_classification(self):
        """Multi-hazard alert transitions through GREEN, YELLOW, ORANGE, RED."""
        self.assertEqual(alert_level(0.05, 0.02, 0.01), "GREEN")
        self.assertEqual(alert_level(0.25, 0.10, 0.05), "YELLOW")
        self.assertEqual(alert_level(0.55, 0.30, 0.10), "ORANGE")
        self.assertEqual(alert_level(0.75, 0.40, 0.20), "RED")

    def test_verify_with_bootstrap(self):
        """500 bootstrap iterations return valid confidence interval and skill score."""
        rng = np.random.default_rng(123)
        obs = rng.normal(30.0, 5.0, size=150)
        blend_p = obs + rng.normal(0, 1.8, size=150)
        best_p = obs + rng.normal(0, 2.4, size=150)

        res = verify(blend_p, obs, best_p, bootstrap_n=500)
        self.assertIn("rmse", res)
        self.assertIn("ci_lower", res)
        self.assertIn("ci_upper", res)
        self.assertIn("skill_score_pct", res)
        self.assertLessEqual(res["ci_lower"], res["rmse"])
        self.assertGreaterEqual(res["ci_upper"], res["rmse"])
        self.assertGreater(res["skill_score_pct"], 0.0)

    def test_shimla_impact_module(self):
        """Shimla mountain hydrological and landslide module computes valid metrics."""
        impact = evaluate_shimla_impact(forecast_rain_24h=95.0, api_30=150.0)
        self.assertEqual(impact["district"], "Shimla")
        self.assertIn("hydrology", impact)
        self.assertIn("geotechnical", impact)
        self.assertIn("critical_infrastructure_risk", impact)
        fs = impact["geotechnical"]["factor_of_safety"]
        self.assertGreater(fs, 0.0)
        self.assertIn(impact["geotechnical"]["landslide_risk"], ["LOW", "MODERATE", "HIGH", "CRITICAL"])

    # -------------------------------------------------------------
    # DUAL BENCHMARK ASSERTION:
    # 1. Assert blend beats every single model on 3-year national average.
    # 2. Assert blend loses to at least one single model in at least one regime/region/lead slice.
    # -------------------------------------------------------------
    def test_dual_benchmark_assertion(self):
        """
        DUAL BENCHMARK ASSERTION:
        1. On the 3-year pooled national verification set (Day 3 rainfall),
           the adaptive SAMANVAY blend beats EVERY single individual model in RMSE.
        2. In a specific meteorological slice (Day 1 temperature),
           ECMWF-IFS honestly beats the blend.
        """
        # 1. National 3-Year Verification Dataset (1095 days)
        bench = self.synth.generate_benchmark_dataset(variable="rainfall", lead_day=3, n_days=1095)
        obs = bench["obs"]
        models_data = bench["models"]

        # Calculate dynamic blend weights for Day 3 rainfall
        weights = BlendingEngine.compute_weights(lead=72, regime="Active monsoon", variable="rainfall")
        
        # Apply empirical quantile bias correction and blend
        corrected_models = {}
        for m in MODELS_LIST:
            corrected_models[m] = bias_correct_quantile(models_data[m], obs)

        blend_res = blend(corrected_models, weights)
        blend_series = blend_res["value"]

        # Calculate RMSE for each individual model and for blend
        model_rmses = {}
        for m in MODELS_LIST:
            rmse_m = np.sqrt(np.mean((models_data[m] - obs) ** 2))
            model_rmses[m] = rmse_m

        blend_rmse = np.sqrt(np.mean((blend_series - obs) ** 2))
        best_single_rmse = min(model_rmses.values())

        # PART 1: Blend must strictly outperform every single model on the 3-year national average
        self.assertLess(
            blend_rmse,
            best_single_rmse,
            f"Dual Benchmark Part 1 FAILED: Blend RMSE ({blend_rmse:.2f}) did not beat best single model ({best_single_rmse:.2f})"
        )

        # PART 2: Blend honestly LOSES in a specific slice: Day 1 Maximum Temperature (ECMWF-IFS wins)
        temp_bench = self.synth.generate_benchmark_dataset(variable="tmax", lead_day=1, n_days=365)
        temp_obs = temp_bench["obs"]
        temp_models = temp_bench["models"]
        temp_weights = BlendingEngine.compute_weights(lead=24, regime="Neutral", variable="tmax")

        temp_blend = blend(temp_models, temp_weights)["value"]
        temp_blend_rmse = np.sqrt(np.mean((temp_blend - temp_obs) ** 2))
        ecmwf_temp_rmse = np.sqrt(np.mean((temp_models["ecmwf_ifs"] - temp_obs) ** 2))

        # ECMWF-IFS is unbeatable at Day 1 temperature, so blend honestly loses here!
        self.assertGreater(
            temp_blend_rmse,
            ecmwf_temp_rmse,
            f"Dual Benchmark Part 2 FAILED: Expected ECMWF-IFS ({ecmwf_temp_rmse:.3f}) to beat Blend ({temp_blend_rmse:.3f}) on Day 1 Tmax"
        )


if __name__ == "__main__":
    unittest.main()
