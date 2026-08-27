const rateLimit = require("express-rate-limit");

// Generous but bounded limits to protect the Gemini quota and DB from abuse
const quickAnalysisLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "rate_limited",
    message: "Too many requests. Please try again shortly.",
  },
});

const detailedAnalysisLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "rate_limited",
    message: "Too many requests. Please try again shortly.",
  },
});

module.exports = { quickAnalysisLimiter, detailedAnalysisLimiter };
