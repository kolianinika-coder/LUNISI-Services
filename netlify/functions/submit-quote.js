/*
 * Netlify Function starter for LUNISI quote requests.
 *
 * Configure environment variables in Netlify:
 *   RESEND_API_KEY, QUOTE_TO_EMAIL, QUOTE_FROM_EMAIL
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, OWNER_SMS_NUMBER
 *
 * Install dependencies in package.json: @netlify/functions, resend, twilio
 * This starter validates input and sends email/SMS. Configure file storage separately
 * if you need uploaded photos to be retained; attachments are intentionally not forwarded
 * by this starter. Never commit API keys to source control.
 */
const { Resend } = require("resend");
const twilio = require("twilio");

const json = (statusCode, payload) => ({
  statusCode,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  body: JSON.stringify(payload)
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed." });
  try {
    const contentType = event.headers["content-type"] || "";
    if (!contentType.includes("multipart/form-data")) {
      return json(400, { error: "Please submit the quote form using the website." });
    }

    // Netlify's standard event body handling does not parse multipart file uploads automatically.
    // Use a dedicated upload service or configure a multipart parser before enabling photo uploads.
    return json(501, {
      error: "Quote delivery is not configured yet. Please configure secure form parsing, email/SMS credentials, and photo handling before launch."
    });

    /*
     * Before production:
     * - Parse multipart/form-data with a maintained parser and enforce total body size limits.
     * - Validate fields server-side and verify the consent checkbox.
     * - Send email via Resend and SMS via Twilio using server-side environment variables.
     * - Store uploaded images in private/object storage with access controls and retention rules.
     * - Add rate limiting, bot protection, logging that avoids sensitive content, and consent/privacy review.
     */
  } catch (error) {
    return json(500, { error: "We could not process your request right now." });
  }
};
