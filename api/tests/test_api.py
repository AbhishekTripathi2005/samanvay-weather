"""
Comprehensive Integration Tests for all 22 REST Endpoints in SAMANVAY API.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import unittest
from fastapi.testclient import TestClient
from main import app

class TestAllEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    # 1. /api/meta
    def test_01_meta(self):
        res = self.client.get("/api/meta")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("models", data)
        self.assertEqual(len(data["models"]), 9)  # 7 models + 1 blend + 1 equal_weight baseline
        self.assertIn("variables", data)
        self.assertEqual(len(data["variables"]), 5)
        self.assertIn("regions", data)
        self.assertEqual(data["regions"]["states_count"], 36)
        self.assertIn("regimes", data)
        self.assertEqual(len(data["regimes"]), 6)
        self.assertIn("leads", data)
        self.assertEqual(len(data["leads"]), 10)

    # 2. /api/kpis
    def test_02_kpis(self):
        res = self.client.get("/api/kpis")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("active_regime", data)
        self.assertIn("national_alert_counts", data)
        self.assertEqual(data["national_alert_counts"]["total_states"], 36)
        self.assertIn("blend_skill_score_24h", data)
        self.assertIn("system_status", data)
        self.assertIn("pilot_districts", data)

    # 3. /api/forecast
    def test_03_forecast(self):
        res = self.client.get("/api/forecast?var=rainfall&lead=3&regime=auto")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["variable"], "rainfall")
        self.assertEqual(data["lead_day"], 3)
        self.assertEqual(len(data["states"]), 36)
        first_st = data["states"][0]
        self.assertIn("consensus", first_st)
        self.assertIn("alert_level", first_st)
        self.assertIn(first_st["alert_level"], ["GREEN", "YELLOW", "ORANGE", "RED"])

    # 4. /api/field
    def test_04_field(self):
        res = self.client.get("/api/field?var=rainfall&lead=3&model=samanvay")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["variable"], "rainfall")
        self.assertEqual(len(data["lats"]), 65)
        self.assertEqual(len(data["lons"]), 61)
        self.assertEqual(len(data["values"]), 65)
        self.assertEqual(len(data["values"][0]), 61)
        self.assertIn("bounds", data)

    # 5. /api/blend/custom
    def test_05_blend_custom(self):
        payload = {
            "variable": "rainfall",
            "lead": 72,
            "region": "DL",
            "weights": {
                "ncum_g": 0.3, "neps": 0.2, "imd_gfs": 0.1, "ecmwf_ifs": 0.2,
                "graphcast": 0.1, "pangu": 0.05, "fourcastnet": 0.05
            }
        }
        res = self.client.post("/api/blend/custom", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("custom", data)
        self.assertIn("operational", data)
        self.assertIn("delta", data)
        self.assertEqual(data["region"], "DL")

    # 6. /api/weights
    def test_06_weights(self):
        res = self.client.get("/api/weights?var=rainfall&lead=3&regime=Active%20monsoon")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["weights"]), 7)
        self.assertAlmostEqual(sum(data["weights"].values()), 1.0, places=3)
        self.assertEqual(len(data["sources"]), 7)

    # 7. /api/weights/matrix
    def test_07_weights_matrix(self):
        res = self.client.get("/api/weights/matrix?var=rainfall")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["lead_matrix"]), 10)
        self.assertEqual(len(data["regime_matrix"]), 6)

    # 8. /api/skill
    def test_08_skill(self):
        res = self.client.get("/api/skill?var=rainfall&lead=3&metric=rmse")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["scorecard"]), 9)  # 7 models + 1 blend + 1 equal_weight
        for s in data["scorecard"]:
            self.assertIn("metrics", s)
            self.assertIn("rmse", s["metrics"])
            self.assertIn("ets", s["metrics"])
            self.assertIn("ci_lower", s)
            self.assertIn("ci_upper", s)
            self.assertIn("skill_improvement_pct", s)
            # Verify 95% CI is valid: ci_lower <= ci_upper
            self.assertLessEqual(s["ci_lower"], s["ci_upper"])

        # Callouts verification
        self.assertIn("callouts", data)
        self.assertIn("headline", data["callouts"])
        self.assertIn("skill_vs_best_pct", data["callouts"])
        self.assertIn("skill_vs_equal_pct", data["callouts"])

        # Win/Loss matrix verification (asserting authentic non-wins)
        self.assertIn("win_loss", data)
        self.assertGreater(data["win_loss"]["blend_wins"], 0)
        self.assertGreater(data["win_loss"]["single_model_wins"], 0)
        self.assertEqual(data["win_loss"]["total_scenarios"], 30)

        # Test metric query parameter
        res_corr = self.client.get("/api/skill?var=rainfall&lead=3&metric=corr")
        self.assertEqual(res_corr.status_code, 200)
        data_corr = res_corr.json()
        self.assertEqual(data_corr["metric"], "corr")

    # 9. /api/skill/taylor
    def test_09_skill_taylor(self):
        res = self.client.get("/api/skill/taylor?var=rainfall&lead=3")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("reference", data)
        self.assertEqual(data["reference"]["correlation"], 1.0)
        self.assertEqual(len(data["models"]), 8)

    # 10. /api/reliability
    def test_10_reliability(self):
        res = self.client.get("/api/reliability?var=rainfall&threshold=64.5&lead=3")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["bins"]), 10)
        self.assertIn("brier_skill_score_pct", data)

    # 11. /api/by-lead
    def test_11_by_lead(self):
        res = self.client.get("/api/by-lead?var=rainfall&metric=rmse")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["curves"]), 10)
        for c in data["curves"]:
            self.assertIn("samanvay", c)
            self.assertIn("ecmwf_ifs", c)

    # 12. /api/extremes
    def test_12_extremes(self):
        res = self.client.get("/api/extremes")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(data["total_active_alerts"], 0)
        self.assertTrue(any(a["district"] == "Shimla" for a in data["alerts"]))

    # 13. /api/extremes/verification
    def test_13_extremes_verification(self):
        res = self.client.get("/api/extremes/verification?var=rainfall")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["thresholds"]), 3)
        for t in data["thresholds"]:
            self.assertIn("models", t)
            self.assertEqual(len(t["models"]), 8)

    # 14. /api/extremes/explain
    def test_14_extremes_explain(self):
        res = self.client.get("/api/extremes/explain?district=shimla")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["district"], "Shimla")
        self.assertIn("features", data)
        self.assertIn("waterfall", data)
        self.assertGreater(data["calibrated_exceedance_probability"], 0.5)

    # 15. /api/regimes/timeline
    def test_15_regimes_timeline(self):
        res = self.client.get("/api/regimes/timeline")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["total_days"], 1095)
        self.assertGreater(len(data["intervals"]), 10)

    # 16. /api/regimes/weights
    def test_16_regimes_weights(self):
        res = self.client.get("/api/regimes/weights")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["regime_weights"]), 6)

    # 17. /api/impact/shimla
    def test_17_impact_shimla(self):
        res = self.client.get("/api/impact/shimla?forecast_rain=90.0&api_30=145.0")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["district"], "Shimla")
        self.assertIn("hydrology", data)
        self.assertIn("geotechnical", data)
        self.assertIn("critical_infrastructure_risk", data)

    # 18. /api/ops/pipeline
    def test_18_ops_pipeline(self):
        res = self.client.get("/api/ops/pipeline")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["active_sources"], 7)
        self.assertEqual(len(data["pipelines"]), 7)

    # 19. /api/ops/history
    def test_19_ops_history(self):
        res = self.client.get("/api/ops/history?limit=15")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["returned_runs"], 15)

    # 20. /api/ops/run (POST)
    def test_20_ops_run(self):
        res = self.client.post("/api/ops/run")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "QUEUED_AND_INITIATED")
        self.assertIn("run_id", data)

    # 21. /api/ops/run/{id}/stream (SSE)
    def test_21_ops_stream(self):
        res = self.client.get("/api/ops/run/TEST-RUN-001/stream")
        self.assertEqual(res.status_code, 200)
        self.assertIn("text/event-stream", res.headers.get("content-type", ""))
        # Check that events are returned
        content = res.text
        self.assertIn("INGEST", content)
        self.assertIn("COMPLETE", content)

    # 22. /api/export/{format}
    def test_22_export(self):
        for fmt in ["geojson", "csv", "netcdf-stub", "pdf-stub"]:
            res = self.client.get(f"/api/export/{fmt}")
            self.assertEqual(res.status_code, 200, f"Export format {fmt} failed")
            self.assertIn("content-disposition", res.headers)

    # 23. /api/forecast/plume
    def test_23_forecast_plume(self):
        res = self.client.get("/api/forecast/plume?region=DL&variable=rainfall")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["region"]["code"], "DL")
        self.assertEqual(len(data["timeline"]), 10)
        self.assertEqual(len(data["quantile_data"]), 21)
        self.assertEqual(len(data["model_scorecards"]), 8)
        self.assertIn("insights", data)

    # 24. /api/weights/map
    def test_24_weights_map(self):
        res = self.client.get("/api/weights/map?variable=rainfall&lead=72")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["regions"]), 36)
        # Check that weights sum to 1.0 for each region
        for r in data["regions"]:
            w_sum = sum(r["weights"].values())
            self.assertAlmostEqual(w_sum, 1.0, places=3)
            self.assertIn(r["dominant_model"], r["weights"])
        self.assertEqual(len(data["reliability_matrix"]["rows"]), 10)
        self.assertEqual(len(data["insights"]), 4)

    # Legacy endpoints
    def test_legacy_health_and_config(self):
        h = self.client.get("/api/health")
        self.assertEqual(h.status_code, 200)
        c = self.client.get("/api/config")
        self.assertEqual(c.status_code, 200)

if __name__ == "__main__":
    unittest.main()
