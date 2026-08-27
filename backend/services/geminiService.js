const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const { COMPONENT_MAX } = require("./riskService");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

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

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    classification: { type: SchemaType.STRING, enum: CLASSIFICATIONS },
    summary: { type: SchemaType.STRING },
    warning_signs: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
        },
        required: ["title", "description"],
      },
    },
    risk_breakdown: {
      type: SchemaType.OBJECT,
      properties: {
        urgency: { type: SchemaType.NUMBER },
        impersonation: { type: SchemaType.NUMBER },
        credential_request: { type: SchemaType.NUMBER },
        suspicious_link: { type: SchemaType.NUMBER },
        financial_request: { type: SchemaType.NUMBER },
        other_risk: { type: SchemaType.NUMBER },
      },
      required: Object.keys(COMPONENT_MAX),
    },
    social_engineering: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          technique: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING, enum: SEVERITIES },
          explanation: { type: SchemaType.STRING },
        },
        required: ["technique", "severity", "explanation"],
      },
    },
    evidence: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: { type: SchemaType.STRING },
          category: { type: SchemaType.STRING },
          reason: { type: SchemaType.STRING },
        },
        required: ["text", "category", "reason"],
      },
    },
    detected_urls: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          url: { type: SchemaType.STRING },
          claimed_brand: { type: SchemaType.STRING, nullable: true },
          is_suspicious: { type: SchemaType.BOOLEAN },
          reason: { type: SchemaType.STRING },
        },
        required: ["url", "is_suspicious", "reason"],
      },
    },
    recommended_actions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          priority: { type: SchemaType.NUMBER },
          action: { type: SchemaType.STRING },
        },
        required: ["priority", "action"],
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
Return JSON only, matching the provided schema exactly. Never wrap the JSON in markdown
code fences or add commentary.`;

async function analyzeMessage(message, reqId = "-") {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const model = genAI.getGenerativeModel(
    {
      model: "gemini-flash-latest",
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
      },
    },
    { timeout: 20000 },
  );

  const prompt = `Analyze this message for phishing/scam indicators:\n\n${message}`;

  console.log(`[Gemini ${reqId}] Request started (model: gemini-flash-latest)`);
  const start = Date.now();

  let result;
  try {
    result = await requestOnce(model, prompt, reqId, start);
  } catch (err) {
    const info = classifyGeminiError(err);

    // Only a genuine 503 (service overloaded) gets a single short retry
    if (info.kind === "unavailable" && info.httpStatus === 503) {
      console.log(`[Gemini ${reqId}] Retrying once in 1000ms...`);
      await sleep(1000);
      try {
        result = await requestOnce(model, prompt, reqId, start, true);
      } catch (retryErr) {
        const retryInfo = classifyGeminiError(retryErr);
        console.log(
          `[Gemini ${reqId}] Retry failed - Status: ${retryInfo.httpStatus} ${retryInfo.reason ?? ""} - Duration: ${Date.now() - start}ms`,
        );
        throw new GeminiApiError(retryInfo);
      }
    } else {
      console.log(
        `[Gemini ${reqId}] Status: ${info.httpStatus ?? "-"} ${info.reason ?? ""} - Message: ${info.message} - Duration: ${Date.now() - start}ms`,
      );
      if (info.retryAfter) {
        console.log(
          `[Gemini ${reqId}] Retry after: ${info.retryAfter}s - not retrying`,
        );
      }
      throw new GeminiApiError(info);
    }
  }

  const text = result.response.text();
  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new GeminiResponseError("Gemini returned malformed JSON");
  }

  validateShape(parsed);
  console.log(`[Gemini ${reqId}] Completed in ${Date.now() - start}ms`);
  return parsed;
}

async function requestOnce(model, prompt, reqId, start, isRetry = false) {
  const result = await model.generateContent(prompt);
  console.log(
    `[Gemini ${reqId}] ${isRetry ? "Retry status" : "Status"}: 200 - Duration: ${Date.now() - start}ms`,
  );
  return result;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Never trust status text alone - Gemini's error details carry the real reason/retry info
function classifyGeminiError(err) {
  const message = err?.message ?? "Unknown Gemini error";

  if (/abort/i.test(message)) {
    return { kind: "timeout", httpStatus: 504, message };
  }

  const httpStatus = err?.status;
  const details = Array.isArray(err?.errorDetails) ? err.errorDetails : [];
  const errorInfo = details.find((d) => d["@type"]?.includes("ErrorInfo"));
  const retryInfo = details.find((d) => d["@type"]?.includes("RetryInfo"));
  const reason = errorInfo?.reason;

  let retryAfter;
  const retryMatch = /^(\d+(?:\.\d+)?)s$/.exec(retryInfo?.retryDelay ?? "");
  if (retryMatch) {
    retryAfter = Math.ceil(parseFloat(retryMatch[1]));
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

class GeminiApiError extends Error {
  constructor({ kind, httpStatus, reason, retryAfter, message }) {
    super(message);
    this.kind = kind;
    this.httpStatus = httpStatus;
    this.reason = reason;
    this.retryAfter = retryAfter;
  }
}

class GeminiResponseError extends Error {}

function validateShape(parsed) {
  const requiredArrays = [
    "warning_signs",
    "social_engineering",
    "evidence",
    "detected_urls",
    "recommended_actions",
  ];

  if (!parsed || typeof parsed !== "object") {
    throw new GeminiResponseError("Gemini response was not an object");
  }
  if (typeof parsed.classification !== "string") {
    throw new GeminiResponseError("Gemini response missing classification");
  }
  if (typeof parsed.summary !== "string") {
    throw new GeminiResponseError("Gemini response missing summary");
  }
  if (!parsed.risk_breakdown || typeof parsed.risk_breakdown !== "object") {
    throw new GeminiResponseError("Gemini response missing risk_breakdown");
  }
  for (const key of requiredArrays) {
    if (!Array.isArray(parsed[key])) {
      throw new GeminiResponseError(
        `Gemini response missing array field: ${key}`,
      );
    }
  }
}

module.exports = { analyzeMessage, GeminiResponseError, GeminiApiError };
