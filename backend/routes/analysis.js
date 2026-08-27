const express = require("express");
const crypto = require("crypto");
const { requireAuth } = require("../middleware/auth");
const {
  quickAnalysisLimiter,
  detailedAnalysisLimiter,
} = require("../middleware/rateLimit");
const { validateAnalyzeRequest } = require("../schemas/analysisSchema");
const aiService = require("../services/openaiService");
const riskService = require("../services/riskService");
const analysisService = require("../services/analysisService");

const router = express.Router();

function buildQuickRecommendation(recommendedActions) {
  if (!Array.isArray(recommendedActions) || recommendedActions.length === 0) {
    return "Avoid interacting with this message until you can verify it through an official channel.";
  }

  return [...recommendedActions]
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
    .slice(0, 2)
    .map((a) => a.action)
    .join(" ");
}

// Runs the AI analysis and normalizes it into our stable shape; never trusts the model's own total
async function runAnalysis(message, reqId) {
  const raw = await aiService.analyzeMessage(message, reqId);
  const { risk_score, risk_breakdown } = riskService.calculateRiskScore(
    raw.risk_breakdown,
  );
  const risk_level = riskService.getRiskLevel(risk_score);

  return {
    risk_score,
    risk_level,
    classification: raw.classification,
    summary: raw.summary,
    warning_signs: raw.warning_signs,
    risk_breakdown,
    social_engineering: raw.social_engineering,
    evidence: raw.evidence,
    detected_urls: raw.detected_urls,
    recommended_actions: raw.recommended_actions,
  };
}

function handleAnalysisError(err, res, reqId) {
  if (err instanceof aiService.AIResponseError) {
    console.error(`[Analysis ${reqId}] Invalid AI response:`, err.message);
    return res.status(502).json({
      error: "invalid_ai_response",
      message:
        "The analysis service returned an unexpected response. Please try again.",
    });
  }

  if (err instanceof aiService.AIApiError) {
    console.log(`[Analysis ${reqId}] Returning HTTP ${err.httpStatus ?? 503} (${err.kind})`);

    switch (err.kind) {
      case "rate_limit":
        return res.status(429).json({
          error: "ai_rate_limit",
          message: "AI usage limit reached. Please try again shortly.",
          ...(err.retryAfter ? { retry_after: err.retryAfter } : {}),
        });
      case "timeout":
        return res.status(504).json({
          error: "ai_timeout",
          message: "AI analysis took too long. Please try again.",
        });
      case "bad_request":
        return res.status(400).json({
          error: "ai_bad_request",
          message: "The analysis request was rejected. Please try again.",
        });
      case "configuration_error":
        return res.status(500).json({
          error: "ai_configuration_error",
          message: "The analysis service is misconfigured.",
        });
      case "model_not_found":
        return res.status(500).json({
          error: "ai_model_not_found",
          message: "The analysis service is misconfigured.",
        });
      case "unavailable":
      default:
        return res.status(503).json({
          error: "ai_unavailable",
          message: "The AI service is temporarily busy. Please try again.",
        });
    }
  }

  console.error(`[Analysis ${reqId}] Analysis failed:`, err.message);
  return res.status(500).json({
    error: "internal_error",
    message: "Something went wrong while analyzing the message.",
  });
}

router.post("/analyze/quick", quickAnalysisLimiter, async (req, res) => {
  const validation = validateAnalyzeRequest(req.body);
  if (!validation.valid) {
    return res
      .status(400)
      .json({ error: "invalid_request", message: validation.message });
  }

  const reqId = crypto.randomUUID().slice(0, 8);
  console.log(`[Analysis ${reqId}] Request received (quick, ${validation.message.length} chars)`);

  try {
    const result = await runAnalysis(validation.message, reqId);
    console.log(`[Analysis ${reqId}] Response returned`);

    return res.status(200).json({
      analysis_id: null,
      risk_score: result.risk_score,
      risk_level: result.risk_level,
      classification: result.classification,
      summary: result.summary,
      warning_signs: result.warning_signs.slice(0, 3),
      quick_recommendation: buildQuickRecommendation(
        result.recommended_actions,
      ),
    });
  } catch (err) {
    return handleAnalysisError(err, res, reqId);
  }
});

router.post(
  "/analyze/detailed",
  detailedAnalysisLimiter,
  requireAuth,
  async (req, res) => {
    const validation = validateAnalyzeRequest(req.body);
    if (!validation.valid) {
      return res
        .status(400)
        .json({ error: "invalid_request", message: validation.message });
    }

    const reqId = crypto.randomUUID().slice(0, 8);
    console.log(`[Analysis ${reqId}] Request received (detailed, ${validation.message.length} chars)`);

    try {
      const result = await runAnalysis(validation.message, reqId);
      const saved = await analysisService.saveAnalysis(
        req.user.id,
        validation.message,
        result,
      );
      console.log(`[Analysis ${reqId}] Response returned`);

      return res.status(200).json({
        analysis_id: saved.id,
        risk_score: saved.risk_score,
        risk_level: saved.risk_level,
        classification: saved.classification,
        summary: saved.summary,
        warning_signs: saved.warning_signs,
        risk_breakdown: saved.risk_breakdown,
        social_engineering: saved.social_engineering,
        evidence: saved.evidence,
        detected_urls: saved.detected_urls,
        recommended_actions: saved.recommended_actions,
        created_at: saved.created_at,
      });
    } catch (err) {
      if (
        err instanceof aiService.AIResponseError ||
        err instanceof aiService.AIApiError
      ) {
        return handleAnalysisError(err, res, reqId);
      }

      console.error(`[Analysis ${reqId}] Failed to save analysis:`, err.message);
      return res.status(500).json({
        error: "internal_error",
        message: "The analysis could not be saved.",
      });
    }
  },
);

router.get("/analyses", requireAuth, async (req, res) => {
  try {
    const rows = await analysisService.listAnalyses(req.user.id);
    const history = rows.map((row) => ({
      analysis_id: row.id,
      risk_score: row.risk_score,
      risk_level: row.risk_level,
      classification: row.classification,
      summary: row.summary,
      created_at: row.created_at,
    }));

    return res.status(200).json(history);
  } catch (err) {
    console.error("Failed to list analyses:", err.message);
    return res.status(500).json({
      error: "internal_error",
      message: "Could not load analysis history.",
    });
  }
});

router.get("/analyses/:id", requireAuth, async (req, res) => {
  try {
    const result = await analysisService.getAnalysisById(
      req.user.id,
      req.params.id,
    );

    if (result.status === "not_found") {
      return res
        .status(404)
        .json({ error: "not_found", message: "Analysis not found." });
    }

    if (result.status === "forbidden") {
      return res.status(403).json({
        error: "forbidden",
        message: "This analysis does not belong to you.",
      });
    }

    const { analysis } = result;
    return res.status(200).json({
      analysis_id: analysis.id,
      risk_score: analysis.risk_score,
      risk_level: analysis.risk_level,
      classification: analysis.classification,
      summary: analysis.summary,
      warning_signs: analysis.warning_signs,
      risk_breakdown: analysis.risk_breakdown,
      social_engineering: analysis.social_engineering,
      evidence: analysis.evidence,
      detected_urls: analysis.detected_urls,
      recommended_actions: analysis.recommended_actions,
      created_at: analysis.created_at,
    });
  } catch (err) {
    console.error("Failed to fetch analysis:", err.message);
    return res.status(500).json({
      error: "internal_error",
      message: "Could not load the analysis.",
    });
  }
});

module.exports = router;
