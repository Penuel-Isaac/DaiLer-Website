// api/contact.js
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Simple parser for raw request body to JSON (works reliably on Vercel functions)
 */
async function parseJSONBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
  }
  try {
    return JSON.parse(body || "{}");
  } catch (e) {
    return {};
  }
}

export default async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const data = await parseJSONBody(req);
  const { firstName, lastName, email, phone, message } = data || {};

  // basic validation
  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const subject = `New contact from DaiLer: ${firstName} ${lastName}`;
  const text = `
Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone || "N/A"}

Message:
${message}
  `;

  try {
    await sendgrid.send({
      to: process.env.EMAIL_TO,       // receiver (your email)
      from: process.env.EMAIL_FROM,   // verified sender in SendGrid
      subject,
      text,
      html: `<pre style="font-family:inherit;">${text.replace(/\n/g, "<br/>")}</pre>`
    });

    return res.status(200).json({ ok: true, message: "Message sent" });
  } catch (err) {
    console.error("SendGrid error:", err && err.response ? err.response.body : err);
    return res.status(500).json({ error: "Failed to send message" });
  }
};
