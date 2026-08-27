const MAX_MESSAGE_LENGTH = 10000;

// Validates the shared request body for both analyze routes; never trusts the caller's structure
function validateAnalyzeRequest(body) {
  if (!body || typeof body !== "object") {
    return { valid: false, message: "Request body must be a JSON object." };
  }

  const { message } = body;

  if (message === undefined || message === null) {
    return { valid: false, message: "Message is required." };
  }

  if (typeof message !== "string") {
    return { valid: false, message: "Message must be a string." };
  }

  const trimmed = message.trim();

  if (trimmed.length === 0) {
    return { valid: false, message: "Message must not be empty." };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return {
      valid: false,
      message: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
    };
  }

  return { valid: true, message: trimmed };
}

module.exports = { validateAnalyzeRequest, MAX_MESSAGE_LENGTH };
