import { createClient } from "@/lib/supabase/client";

export interface WarningSign {
  title: string;
  description: string;
}

export interface RiskBreakdown {
  urgency: number;
  impersonation: number;
  credential_request: number;
  suspicious_link: number;
  financial_request: number;
  other_risk: number;
}

export interface SocialEngineeringItem {
  technique: string;
  severity: "low" | "medium" | "high";
  explanation: string;
}

export interface EvidenceItem {
  text: string;
  category: string;
  reason: string;
}

export interface DetectedUrl {
  url: string;
  claimed_brand: string | null;
  is_suspicious: boolean;
  reason: string;
}

export interface RecommendedAction {
  priority: number;
  action: string;
}

export interface QuickAnalysisResult {
  analysis_id: string | null;
  risk_score: number;
  risk_level: "low" | "suspicious" | "high" | "very_high";
  classification: string;
  summary: string;
  warning_signs: WarningSign[];
  quick_recommendation: string;
}

export interface DetailedAnalysisResult {
  analysis_id: string;
  risk_score: number;
  risk_level: "low" | "suspicious" | "high" | "very_high";
  classification: string;
  summary: string;
  warning_signs: WarningSign[];
  risk_breakdown: RiskBreakdown;
  social_engineering: SocialEngineeringItem[];
  evidence: EvidenceItem[];
  detected_urls: DetectedUrl[];
  recommended_actions: RecommendedAction[];
  created_at: string;
}

export interface HistoryItem {
  analysis_id: string;
  risk_score: number;
  risk_level: "low" | "suspicious" | "high" | "very_high";
  classification: string;
  summary: string;
  created_at: string;
}

export class ApiError extends Error {
  code: string;
  status: number;
  retryAfter?: number;

  constructor(
    code: string,
    message: string,
    status: number,
    retryAfter?: number,
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

async function parseErrorBody(res: Response): Promise<ApiError> {
  try {
    const body = await res.json();
    return new ApiError(
      body.error ?? "unknown_error",
      body.message ?? "Something went wrong.",
      res.status,
      body.retry_after,
    );
  } catch {
    return new ApiError("unknown_error", "Something went wrong.", res.status);
  }
}

export async function getAccessToken(): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function analyzeQuick(
  message: string,
  image?: string,
): Promise<QuickAnalysisResult> {
  const res = await fetch("/api/analyze/quick", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, image }),
  });

  if (!res.ok) throw await parseErrorBody(res);
  return res.json();
}

export async function analyzeDetailed(
  message: string,
  token: string,
  image?: string,
): Promise<DetailedAnalysisResult> {
  const res = await fetch("/api/analyze/detailed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, image }),
  });

  if (!res.ok) throw await parseErrorBody(res);
  return res.json();
}

export async function fetchAnalyses(token: string): Promise<HistoryItem[]> {
  const res = await fetch("/api/analyses", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw await parseErrorBody(res);
  return res.json();
}

export async function fetchAnalysisById(
  id: string,
  token: string,
): Promise<DetailedAnalysisResult> {
  const res = await fetch(`/api/analyses/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw await parseErrorBody(res);
  return res.json();
}

export function describeApiError(err: unknown): {
  title: string;
  message: string;
} {
  if (err instanceof ApiError) {
    switch (err.code) {
      case "ai_rate_limit":
        return {
          title: "AI usage limit reached",
          message: err.retryAfter
            ? `The AI service has reached its current usage limit. Try again in approximately ${err.retryAfter} seconds.`
            : "The AI service has reached its current usage limit. Please try again shortly.",
        };
      case "ai_unavailable":
        return {
          title: "AI temporarily busy",
          message:
            "The AI service is currently experiencing high demand. Please try again.",
        };
      case "ai_timeout":
        return {
          title: "Analysis timed out",
          message: "The analysis took too long. Please try again.",
        };
      case "invalid_request":
        return { title: "Invalid message", message: err.message };
      case "authentication_required":
        return {
          title: "Sign in required",
          message: "Please sign in to view detailed results.",
        };
      case "forbidden":
        return {
          title: "Not accessible",
          message: "This analysis does not belong to you.",
        };
      case "not_found":
        return {
          title: "Not found",
          message: "That analysis could not be found.",
        };
      default:
        return { title: "Something went wrong", message: err.message };
    }
  }
  return { title: "Something went wrong", message: "Please try again." };
}
