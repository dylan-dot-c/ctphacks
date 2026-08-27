const COMPONENT_MAX = {
  urgency: 20,
  impersonation: 20,
  credential_request: 25,
  suspicious_link: 20,
  financial_request: 10,
  other_risk: 5,
};

function clamp(value, min, max) {
  const n = Number.isFinite(value) ? value : 0;
  return Math.min(max, Math.max(min, n));
}

// Never trusts an AI-provided total; always recomputes from clamped component scores
function calculateRiskScore(rawBreakdown = {}) {
  const breakdown = {};
  let total = 0;

  for (const [key, max] of Object.entries(COMPONENT_MAX)) {
    const value = clamp(Math.round(rawBreakdown[key]), 0, max);
    breakdown[key] = value;
    total += value;
  }

  const risk_score = clamp(total, 0, 100);

  return { risk_score, risk_breakdown: breakdown };
}

function getRiskLevel(score) {
  if (score >= 80) return "very_high";
  if (score >= 60) return "high";
  if (score >= 30) return "suspicious";
  return "low";
}

module.exports = { calculateRiskScore, getRiskLevel, COMPONENT_MAX };
