// Sponsor-form relay: the static site POSTs JSON to /api/sponsor (see the
// rewrite in firebase.json) and this function forwards it to a Slack incoming
// webhook. The webhook URL lives in Secret Manager so it never ships to the browser.
//
//   firebase functions:secrets:set SLACK_WEBHOOK_URL

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const SLACK_WEBHOOK_URL = defineSecret("SLACK_WEBHOOK_URL");

const clip = (v, n) => String(v ?? "").trim().slice(0, n);
const mrkdwn = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function buildMessage(body) {
  const name = clip(body.name, 120);
  const email = clip(body.email, 200);
  const org = clip(body.org, 160);
  const message = clip(body.message, 2000);
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return {
    text: `New sponsor inquiry from ${name}`,
    blocks: [
      { type: "header", text: { type: "plain_text", text: "New sponsor inquiry" } },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Name*\n${mrkdwn(name)}` },
          { type: "mrkdwn", text: `*Email*\n${mrkdwn(email)}` },
          { type: "mrkdwn", text: `*Organization*\n${mrkdwn(org) || "—"}` },
        ],
      },
      { type: "section", text: { type: "mrkdwn", text: `*Message*\n${mrkdwn(message)}` } },
    ],
  };
}

exports.sponsor = onRequest(
  { secrets: [SLACK_WEBHOOK_URL], region: "us-central1", maxInstances: 3, cors: false },
  async (req, res) => {
    if (req.method !== "POST") return res.status(405).set("Allow", "POST").end();
    const body = typeof req.body === "object" && req.body ? req.body : {};

    // Honeypot: bots fill the hidden field. Pretend success, send nothing.
    if (clip(body.website, 1)) return res.status(204).end();

    const payload = buildMessage(body);
    if (!payload) return res.status(400).json({ error: "invalid" });

    const slack = await fetch(SLACK_WEBHOOK_URL.value(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!slack.ok) return res.status(502).json({ error: "upstream" });
    return res.status(204).end();
  },
);

exports._buildMessage = buildMessage;
