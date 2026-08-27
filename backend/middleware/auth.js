const { supabaseAuthClient } = require("../lib/supabaseClient");

// Verifies the Supabase access token and attaches the authenticated user; rejects otherwise
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      error: "authentication_required",
      message: "A valid Bearer token is required.",
    });
  }

  if (!supabaseAuthClient) {
    console.error(
      "Supabase auth client is not configured (missing SUPABASE_URL/ANON_KEY)",
    );
    return res.status(500).json({
      error: "internal_error",
      message: "Authentication is not configured.",
    });
  }

  try {
    const { data, error } = await supabaseAuthClient.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        error: "authentication_required",
        message: "Invalid or expired session.",
      });
    }

    req.user = data.user;
    next();
  } catch (err) {
    console.error("Auth verification failed:", err.message);
    return res.status(401).json({
      error: "authentication_required",
      message: "Invalid or expired session.",
    });
  }
}

module.exports = { requireAuth };
