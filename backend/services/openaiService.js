const OpenAI = require("openai");
const { COMPONENT_MAX } = require("./riskService");

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey, timeout: 20000 }) : null;

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const CLASSIFICATIONS = [
  "credential_phishing",
  "financial_scam",
  "malware_delivery",
  "impersonation",
  "lottery_prize_scam",
  "tech_support_scam",
  "romance_scam",
  "not_suspicious",
  "other",
];

const SEVERITIES = ["low", "medium", "high"];

// Chat Completions structured output schema - mirrors geminiService's shape exactly
const responseSchema = {
  type: "object",
  properties: {
    classification: { type: "string", enum: CLASSIFICATIONS },
    summary: { type: "string" },
    warning_signs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
        },
        required: ["title", "description"],
        additionalProperties: false,
      },
    },
    risk_breakdown: {
      type: "object",
      properties: {
        urgency: { type: "number" },
        impersonation: { type: "number" },
        credential_request: { type: "number" },
        suspicious_link: { type: "number" },
        financial_request: { type: "number" },
        other_risk: { type: "number" },
      },
      required: Object.keys(COMPONENT_MAX),
      additionalProperties: false,
    },
    social_engineering: {
      type: "array",
      items: {
        type: "object",
        properties: {
          technique: { type: "string" },
          severity: { type: "string", enum: SEVERITIES },
          explanation: { type: "string" },
        },
        required: ["technique", "severity", "explanation"],
        additionalProperties: false,
      },
    },
    evidence: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          category: { type: "string" },
          reason: { type: "string" },
        },
        required: ["text", "category", "reason"],
        additionalProperties: false,
      },
    },
    detected_urls: {
      type: "array",
      items: {
        type: "object",
        properties: {
          url: { type: "string" },
          claimed_brand: { type: ["string", "null"] },
          is_suspicious: { type: "boolean" },
          reason: { type: "string" },
        },
        required: ["url", "claimed_brand", "is_suspicious", "reason"],
        additionalProperties: false,
      },
    },
    recommended_actions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          priority: { type: "number" },
          action: { type: "string" },
        },
        required: ["priority", "action"],
        additionalProperties: false,
      },
    },
  },
  required: [
    "classification",
    "summary",
    "warning_signs",
    "risk_breakdown",
    "social_engineering",
    "evidence",
    "detected_urls",
    "recommended_actions",
  ],
  additionalProperties: false,
};

const SYSTEM_INSTRUCTION = `You are a phishing and scam detection analyst.
Analyze ONLY the message text supplied by the user. Do not invent sender information,
headers, or context that is not present in the message.
Do not claim a URL is malicious unless there is clear evidence in the message itself;
distinguish between "suspicious" (unverified) and "confirmed malicious" framing.
Quote evidence snippets verbatim and keep them short - only quote text actually present
in the user's message.
Score each risk_breakdown component within its maximum:
urgency 0-20, impersonation 0-20, credential_request 0-25, suspicious_link 0-20,
financial_request 0-10, other_risk 0-5. These are independent component scores, not a total.
Return JSON only, matching the provided schema exactly.`;

async function analyzeMessage(message, reqId = "-") {
  if (!client) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const start = Date.now();
  console.log(`[OpenAI ${reqId}] Request started (model: ${MODEL})`);

  let completion;
  try {
    completion = await requestOnce(message, reqId, start);
  } catch (err) {
    const info = classifyOpenAIError(err);

    // Only a genuine 5xx (service overloaded) gets a single short retry
    if (info.kind === "unavailable" && info.httpStatus >= 500) {
      console.log(`[OpenAI ${reqId}] Retrying once in 1000ms...`);
      await sleep(1000);
      try {
        completion = await requestOnce(message, reqId, start, true);
      } catch (retryErr) {
        const retryInfo = classifyOpenAIError(retryErr);
        console.log(
          `[OpenAI ${reqId}] Retry failed - Status: ${retryInfo.httpStatus} ${retryInfo.reason ?? ""} - Duration: ${Date.now() - start}ms`,
        );
        throw new AIApiError(retryInfo);
      }
    } else {
      console.log(
        `[OpenAI ${reqId}] Status: ${info.httpStatus ?? "-"} ${info.reason ?? ""} - Message: ${info.message} - Duration: ${Date.now() - start}ms`,
      );
      if (info.retryAfter) {
        console.log(
          `[OpenAI ${reqId}] Retry after: ${info.retryAfter}s - not retrying`,
        );
      }
      throw new AIApiError(info);
    }
  }

  const text = completion.choices?.[0]?.message?.content;
  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new AIResponseError("OpenAI returned malformed JSON");
  }

  validateShape(parsed);
  console.log(`[OpenAI ${reqId}] Completed in ${Date.now() - start}ms`);
  return parsed;
}

async function requestOnce(message, reqId, start, isRetry = false) {
  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_INSTRUCTION },
      {
        role: "user",
        content: `Analyze this message for phishing/scam indicators:\n\n${message}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "phishing_analysis",
        schema: responseSchema,
        strict: true,
      },
    },
  });

  console.log(
    `[OpenAI ${reqId}] ${isRetry ? "Retry status" : "Status"}: 200 - Duration: ${Date.now() - start}ms`,
  );
  return completion;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Never trust status text alone - OpenAI's error body carries the real type/retry info
function classifyOpenAIError(err) {
  const message = err?.message ?? "Unknown OpenAI error";

  if (
    /abort|timeout/i.test(message) ||
    err?.name === "APIConnectionTimeoutError"
  ) {
    return { kind: "timeout", httpStatus: 504, message };
  }

  const httpStatus = err?.status;
  const reason = err?.error?.type || err?.code;

  let retryAfter;
  const headerValue = err?.headers?.["retry-after"];
  if (headerValue && !Number.isNaN(Number(headerValue))) {
    retryAfter = Number(headerValue);
  }

  let kind;
  if (httpStatus === 429) kind = "rate_limit";
  else if (httpStatus === 400) kind = "bad_request";
  else if (httpStatus === 401 || httpStatus === 403)
    kind = "configuration_error";
  else if (httpStatus === 404) kind = "model_not_found";
  else if (httpStatus === 503 || httpStatus >= 500) kind = "unavailable";
  else kind = "unknown";

  return { kind, httpStatus, reason, retryAfter, message };
}

class AIApiError extends Error {
  constructor({ kind, httpStatus, reason, retryAfter, message }) {
    super(message);
    this.kind = kind;
    this.httpStatus = httpStatus;
    this.reason = reason;
    this.retryAfter = retryAfter;
  }
}

class AIResponseError extends Error {}

function validateShape(parsed) {
  const requiredArrays = [
    "warning_signs",
    "social_engineering",
    "evidence",
    "detected_urls",
    "recommended_actions",
  ];

  if (!parsed || typeof parsed !== "object") {
    throw new AIResponseError("OpenAI response was not an object");
  }
  if (typeof parsed.classification !== "string") {
    throw new AIResponseError("OpenAI response missing classification");
  }
  if (typeof parsed.summary !== "string") {
    throw new AIResponseError("OpenAI response missing summary");
  }
  if (!parsed.risk_breakdown || typeof parsed.risk_breakdown !== "object") {
    throw new AIResponseError("OpenAI response missing risk_breakdown");
  }
  for (const key of requiredArrays) {
    if (!Array.isArray(parsed[key])) {
      throw new AIResponseError(`OpenAI response missing array field: ${key}`);
    }
  }
}

module.exports = { analyzeMessage, AIResponseError, AIApiError };
