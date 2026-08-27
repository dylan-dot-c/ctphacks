# Backend API

Express server for phishing/scam message analysis using OpenAI (primary) with a Gemini implementation kept available. Base URL locally: `http://localhost:3001`.

## Auth

Authenticated routes require a Supabase access token:

```
Authorization: Bearer <supabase_access_token>
```

Get the token client-side via `const { data } = await supabase.auth.getSession(); data.session.access_token`.

---

## POST /api/analyze/quick

Public. Does not save the scan.

**Request body**

```json
{
  "message": "Your account has been suspended. Verify your password immediately at http://example.com"
}
```

**Response 200**

```json
{
  "analysis_id": null,
  "risk_score": 87,
  "risk_level": "high",
  "classification": "credential_phishing",
  "summary": "This message contains several characteristics commonly associated with phishing.",
  "warning_signs": [
    {
      "title": "Artificial urgency",
      "description": "The message pressures the user to act immediately."
    },
    {
      "title": "Credential request",
      "description": "The message asks the user to verify sensitive account information."
    },
    {
      "title": "Suspicious link",
      "description": "The provided link may not belong to the claimed organization."
    }
  ],
  "quick_recommendation": "Do not click the link. Do not provide passwords, verification codes, or personal information."
}
```

---

## POST /api/analyze/detailed

Requires auth. Saves the analysis for the logged-in user.

**Request body** (same shape as quick)

```json
{
  "message": "Your account has been suspended. Verify your password immediately at http://example.com"
}
```

**Response 200**

```json
{
  "analysis_id": "3f1c9e2a-1b2a-4c3d-8e4f-5a6b7c8d9e0f",
  "risk_score": 87,
  "risk_level": "high",
  "classification": "credential_phishing",
  "summary": "This message is likely attempting to steal account credentials by creating urgency and directing the user to a suspicious verification page.",
  "warning_signs": [
    {
      "title": "Artificial urgency",
      "description": "The message claims immediate action is required."
    },
    {
      "title": "Credential harvesting",
      "description": "The message requests verification of sensitive login information."
    },
    {
      "title": "Suspicious destination",
      "description": "The link does not appear to match the organization being impersonated."
    }
  ],
  "risk_breakdown": {
    "urgency": 18,
    "impersonation": 17,
    "credential_request": 25,
    "suspicious_link": 20,
    "financial_request": 0,
    "other_risk": 7
  },
  "social_engineering": [
    {
      "technique": "urgency",
      "severity": "high",
      "explanation": "The message pressures the recipient to act immediately."
    },
    {
      "technique": "fear",
      "severity": "medium",
      "explanation": "It threatens account suspension if the recipient does not comply."
    }
  ],
  "evidence": [
    {
      "text": "Your account has been suspended",
      "category": "fear",
      "reason": "Threatens loss of account access."
    },
    {
      "text": "Verify your password immediately",
      "category": "credential_request",
      "reason": "Requests sensitive authentication information."
    }
  ],
  "detected_urls": [
    {
      "url": "http://example.com",
      "claimed_brand": null,
      "is_suspicious": true,
      "reason": "The destination should be independently verified before visiting."
    }
  ],
  "recommended_actions": [
    { "priority": 1, "action": "Do not click the link." },
    {
      "priority": 2,
      "action": "Do not provide passwords, verification codes, or personal information."
    },
    {
      "priority": 3,
      "action": "Visit the organization's official website or app directly."
    }
  ],
  "created_at": "2026-08-27T12:00:00Z"
}
```

**Real example (live response)**

```json
{
  "analysis_id": "e8ef080f-177f-4eaa-8cd5-28be55ad03fb",
  "risk_score": 65,
  "risk_level": "high",
  "classification": "credential_phishing",
  "summary": "The message pressures the recipient to act quickly and provides a link to verify sensitive information, indicating potential phishing.",
  "warning_signs": [
    {
      "title": "Urgency",
      "description": "Uses 'URGENT' and a 24-hour deadline to create panic."
    },
    {
      "title": "Credential Request",
      "description": "Requests verification of username, password, and security information."
    },
    {
      "title": "Suspicious Link",
      "description": "Directs to a URL that mimics legitimate verification pages."
    }
  ],
  "risk_breakdown": {
    "urgency": 20,
    "other_risk": 0,
    "impersonation": 0,
    "suspicious_link": 20,
    "financial_request": 0,
    "credential_request": 25
  },
  "social_engineering": [
    {
      "severity": "high",
      "technique": "Fear-based urgency",
      "explanation": "The message warns of immediate account suspension, prompting hasty action."
    },
    {
      "severity": "high",
      "technique": "Phishing for credentials",
      "explanation": "Requests sensitive information in a deceptive manner."
    }
  ],
  "evidence": [
    {
      "text": "Your account will be suspended within 24 hours",
      "reason": "Creates a panic situation demanding immediate action.",
      "category": "urgency"
    },
    {
      "text": "Verify your username, password, and security information",
      "reason": "Direct request for sensitive account credentials.",
      "category": "credential_request"
    },
    {
      "text": "immediately at https://account-verification.example",
      "reason": "Requests user to click a potentially malicious link.",
      "category": "suspicious_link"
    }
  ],
  "detected_urls": [
    {
      "url": "https://account-verification.example",
      "reason": "URL resembles legitimate sites but is unverified.",
      "claimed_brand": null,
      "is_suspicious": true
    }
  ],
  "recommended_actions": [
    {
      "action": "Immediately mark as spam and do not interact with the link.",
      "priority": 1
    },
    {
      "action": "Report the message to relevant authorities or IT department.",
      "priority": 2
    }
  ],
  "created_at": "2026-08-27T17:42:58.926865+00:00"
}
```

Note field order/key ordering and array lengths can vary between requests (e.g. `recommended_actions` may return 2 or 3 items) - the frontend should not assume a fixed array length for any field except the sliced 3-item `warning_signs` on the quick route.

---

## GET /api/analyses

Requires auth. Returns the caller's scan history, newest first.

**Response 200**

```json
[
  {
    "analysis_id": "3f1c9e2a-1b2a-4c3d-8e4f-5a6b7c8d9e0f",
    "risk_score": 87,
    "risk_level": "high",
    "classification": "credential_phishing",
    "summary": "Likely credential phishing attempt.",
    "created_at": "2026-08-27T12:00:00Z"
  }
]
```

---

## GET /api/analyses/:id

Requires auth. Returns the full saved report if it belongs to the caller.

Response body: same shape as the `/api/analyze/detailed` response above.

---

## Error format

All errors follow:

```json
{
  "error": "invalid_request",
  "message": "Message is required."
}
```

| Status | error                     | Meaning                                     |
| ------ | ------------------------- | ------------------------------------------- |
| 400    | `invalid_request`         | Missing/empty/too-long `message`            |
| 401    | `authentication_required` | Missing/invalid/expired Bearer token        |
| 403    | `forbidden`               | Analysis exists but belongs to another user |
| 404    | `not_found`               | Analysis id does not exist                  |
| 429    | `rate_limited`            | Too many requests to this route             |
| 502    | `invalid_ai_response`     | Gemini returned malformed/incomplete JSON   |
| 503    | `ai_unavailable`          | Gemini is overloaded/rate-limited upstream  |
| 500    | `internal_error`          | Unexpected server error                     |

## Environment variables

See [.env.example](.env.example): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`.
