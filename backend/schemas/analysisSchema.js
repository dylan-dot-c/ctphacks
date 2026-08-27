const MAX_MESSAGE_LENGTH = 10000;
// ~7MB base64 comfortably covers a 5MB image while staying under the 10mb body limit
const MAX_IMAGE_BASE64_LENGTH = 7 * 1024 * 1024;
const IMAGE_DATA_URL_PATTERN =
  /^data:image\/(png|jpe?g|webp|gif);base64,([A-Za-z0-9+/]+={0,2})$/;

// Validates the shared request body for both analyze routes; never trusts the caller's structure
function validateAnalyzeRequest(body) {
  if (!body || typeof body !== "object") {
    return { valid: false, message: "Request body must be a JSON object." };
  }

  const { message, image } = body;

  const hasMessage =
    message !== undefined && message !== null && message !== "";
  const hasImage = image !== undefined && image !== null && image !== "";

  if (!hasMessage && !hasImage) {
    return { valid: false, message: "Either message or image is required." };
  }

  let trimmedMessage = "";
  if (hasMessage) {
    if (typeof message !== "string") {
      return { valid: false, message: "Message must be a string." };
    }
    trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return { valid: false, message: "Message must not be empty." };
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return {
        valid: false,
        message: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
      };
    }
  }

  if (hasImage) {
    if (typeof image !== "string" || !IMAGE_DATA_URL_PATTERN.test(image)) {
      return {
        valid: false,
        message: "Image must be a base64 data URL (png, jpg, webp, or gif).",
      };
    }
    if (image.length > MAX_IMAGE_BASE64_LENGTH) {
      return { valid: false, message: "Image is too large." };
    }
  }

  return {
    valid: true,
    message: trimmedMessage,
    image: hasImage ? image : undefined,
  };
}

module.exports = { validateAnalyzeRequest, MAX_MESSAGE_LENGTH };
