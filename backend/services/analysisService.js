const { supabaseAdmin } = require("../lib/supabaseClient");

const TABLE = "analyses";

function assertAdminClient() {
  if (!supabaseAdmin) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
}

// message_text is stored for the user's own history, scoped by RLS + explicit user_id filtering
async function saveAnalysis(userId, messageText, analysis) {
  assertAdminClient();

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({
      user_id: userId,
      message_text: messageText,
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
    })
    .select(
      "id, risk_score, risk_level, classification, summary, warning_signs, risk_breakdown, social_engineering, evidence, detected_urls, recommended_actions, created_at",
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function listAnalyses(userId) {
  assertAdminClient();

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("id, risk_score, risk_level, classification, summary, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

async function getAnalysisById(userId, id) {
  assertAdminClient();

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select(
      "id, user_id, risk_score, risk_level, classification, summary, warning_signs, risk_breakdown, social_engineering, evidence, detected_urls, recommended_actions, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return { status: "not_found" };
  }

  if (data.user_id !== userId) {
    return { status: "forbidden" };
  }

  const { user_id, ...analysis } = data;
  return { status: "ok", analysis };
}

async function getAnalysisSourceMessage(userId, id) {
  assertAdminClient();

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("id, user_id, message_text")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return { status: "not_found" };
  }

  if (data.user_id !== userId) {
    return { status: "forbidden" };
  }

  return { status: "ok", message: data.message_text };
}

module.exports = {
  saveAnalysis,
  listAnalyses,
  getAnalysisById,
  getAnalysisSourceMessage,
};
