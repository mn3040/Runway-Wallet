import math
import unittest

from research_service.main import rows_from_prices, train


class ResearchModelTests(unittest.TestCase):
    def setUp(self):
        self.prices = [
            {
                "date": f"2025-{(index // 28) + 1:02d}-{(index % 28) + 1:02d}",
                "close": 100 + index * 0.08 + math.sin(index / 8) * 2,
            }
            for index in range(420)
        ]

    def test_feature_pipeline_produces_finite_rows(self):
        rows = rows_from_prices(self.prices)
        self.assertGreater(len(rows), 300)
        self.assertEqual(len(rows[0].features), 6)
        self.assertTrue(all(math.isfinite(feature) for feature in rows[-1].features))

    def test_classifier_returns_probability(self):
        rows = rows_from_prices(self.prices)
        predictor = train(rows[:252])
        probability = predictor(rows[252].features)
        self.assertGreaterEqual(probability, 0)
        self.assertLessEqual(probability, 1)


if __name__ == "__main__":
    unittest.main()
