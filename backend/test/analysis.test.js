const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");

const riskService = require("../services/riskService");
const { validateAnalyzeRequest } = require("../schemas/analysisSchema");
const { classifyOpenAIError } = require("../services/openaiService");
const geminiService = require("../services/geminiService");

test("risk scores are recomputed from clamped components", () => {
  const result = riskService.calculateRiskScore({
    urgency: 22,
    impersonation: -2,
    credential_request: 12.6,
    suspicious_link: "bad",
    financial_request: 10,
    other_risk: 5,
  });

  assert.deepEqual(result, {
    risk_score: 48,
    risk_breakdown: {
      urgency: 20,
      impersonation: 0,
      credential_request: 13,
      suspicious_link: 0,
      financial_request: 10,
      other_risk: 5,
    },
  });
});

test("risk level boundaries remain stable", () => {
  assert.equal(riskService.getRiskLevel(29), "low");
  assert.equal(riskService.getRiskLevel(30), "suspicious");
  assert.equal(riskService.getRiskLevel(60), "high");
  assert.equal(riskService.getRiskLevel(80), "very_high");
});

test("analysis validation trims valid messages and rejects invalid input", () => {
  assert.deepEqual(validateAnalyzeRequest({ message: "  hello  " }), {
    valid: true,
    message: "hello",
  });
  assert.equal(validateAnalyzeRequest({ message: "   " }).valid, false);
  assert.equal(validateAnalyzeRequest({ message: 42 }).valid, false);
});

test("OpenAI failures are classified for user-visible AI errors", () => {
  assert.equal(classifyOpenAIError({ status: 429 }).kind, "rate_limit");
  assert.equal(classifyOpenAIError({ status: 503 }).kind, "unavailable");
  assert.equal(
    classifyOpenAIError({ name: "APIConnectionTimeoutError" }).kind,
    "timeout",
  );
});

test("Gemini HTTP failures map to stable retry behavior", () => {
  assert.equal(geminiService.classifyGeminiError({ status: 400 }).kind, "bad_request");
  assert.equal(geminiService.classifyGeminiError({ status: 401 }).kind, "configuration_error");
  assert.equal(geminiService.classifyGeminiError({ status: 404 }).kind, "model_not_found");
  assert.equal(geminiService.classifyGeminiError({ status: 503 }).kind, "unavailable");

  const result = geminiService.classifyGeminiError({
    status: 429,
    errorDetails: [
      { "@type": "type.googleapis.com/google.rpc.RetryInfo", retryDelay: "1.2s" },
    ],
  });

  assert.equal(result.kind, "rate_limit");
  assert.equal(result.retryAfter, 2);
});

test("Gemini aborts are treated as timeouts", () => {
  const result = geminiService.classifyGeminiError({ message: "request aborted" });

  assert.equal(result.kind, "timeout");
  assert.equal(result.httpStatus, 504);
});

test("Gemini response validation rejects incomplete responses", () => {
  assert.throws(
    () => geminiService.validateShape({ classification: "other" }),
    (error) =>
      error instanceof geminiService.GeminiResponseError &&
      error.message.includes("summary"),
  );
  assert.throws(
    () => geminiService.validateShape({
      classification: "other",
      summary: "Summary",
      risk_breakdown: {},
      warning_signs: [],
      social_engineering: [],
      evidence: [],
      detected_urls: [],
      recommended_actions: "not-an-array",
    }),
    geminiService.GeminiResponseError,
  );
});

test("Gemini response validation accepts the stable response shape", () => {
  assert.doesNotThrow(() =>
    geminiService.validateShape({
      classification: "other",
      summary: "Summary",
      risk_breakdown: { urgency: 0 },
      warning_signs: [],
      social_engineering: [],
      evidence: [],
      detected_urls: [],
      recommended_actions: [],
    }),
  );
});

test("missing Gemini configuration is reported as an AI configuration error", async () => {
  const script = `
    delete process.env.GEMINI_API_KEY;
    const service = require(${JSON.stringify(require.resolve("../services/geminiService"))});
    service.analyzeMessage("test").catch((error) => {
      console.log(JSON.stringify({ name: error.constructor.name, kind: error.kind, status: error.httpStatus }));
    });
  `;
  const result = spawnSync(process.execPath, ["-e", script], {
    env: { ...process.env, GEMINI_API_KEY: "" },
    encoding: "utf8",
  });

  assert.equal(result.status, 0);
  assert.deepEqual(JSON.parse(result.stdout.trim()), {
    name: "GeminiApiError",
    kind: "configuration_error",
    status: 500,
  });
});
