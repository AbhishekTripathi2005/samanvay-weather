import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import unittest
from config import SOURCES, VARIABLES, REGIMES, LEAD_HOURS
from adapters import ADAPTERS, get_adapter
from blending.engine import BlendingEngine
from extremes.thresholds import ExtremeEvaluator
from pinn.consistency import PINNEngine

class TestBackend(unittest.TestCase):
    def test_all_seven_sources_registered(self):
        self.assertEqual(len(ADAPTERS), 7)
        expected = ['ncum_g', 'neps', 'imd_gfs', 'ecmwf_ifs', 'graphcast', 'pangu', 'fourcastnet']
        for s in expected:
            self.assertIn(s, ADAPTERS)
            adapter = get_adapter(s)
            self.assertIsNotNone(adapter.name)
            self.assertTrue(adapter.color.startswith('#'))

    def test_source_fetch_returns_valid_dataset(self):
        adapter = get_adapter('ncum_g')
        ds = adapter.fetch('rainfall', lead=24, regime='Active monsoon', season='JJAS')
        self.assertIn('rainfall', ds.data_vars)
        self.assertIn('lat', ds.coords)
        self.assertIn('lon', ds.coords)
        self.assertEqual(ds.rainfall.values.shape, (65, 61))

    def test_neps_ensemble_members(self):
        neps = get_adapter('neps')
        members = neps.fetch_members('rainfall', lead=48, region_code='DL')
        self.assertEqual(len(members), 21)
        self.assertTrue(members[0]['is_control'])
        self.assertTrue(all('value' in m for m in members))

    def test_adaptive_weights_sum_to_one(self):
        for lead in [24, 72, 120, 240]:
            weights = BlendingEngine.compute_weights(lead, 'Active monsoon', 'rainfall')
            self.assertEqual(len(weights), 7)
            total = sum(weights.values())
            self.assertAlmostEqual(total, 1.0, places=3)

    def test_blending_engine_regional(self):
        res = BlendingEngine.blend_regional('rainfall', 24, 'DL', 'Active monsoon', 'JJAS')
        self.assertIn('consensus', res)
        self.assertGreaterEqual(res['consensus']['value'], 0.0)
        self.assertLessEqual(res['consensus']['p10'], res['consensus']['p90'])

    def test_extreme_risk_evaluation(self):
        risks = ExtremeEvaluator.evaluate_state_risk(24, 'Active monsoon', 'JJAS')
        self.assertEqual(len(risks), 36)
        valid_alerts = {'GREEN', 'YELLOW', 'ORANGE', 'RED'}
        for r in risks:
            self.assertIn(r['alert_level'], valid_alerts)
            self.assertIn('metrics', r)
            self.assertIn('sop_action', r)

    def test_pinn_metrics_labelled_from_prior_study(self):
        metrics = PINNEngine.get_study_metrics()
        self.assertEqual(metrics['label'], 'from prior study')
        self.assertIn('mass_conservation_violation_pct', metrics)
        self.assertIn('precipitation_rmse_mm', metrics)
        self.assertEqual(len(metrics['historical_extreme_case_studies']), 3)

if __name__ == '__main__':
    unittest.main()
