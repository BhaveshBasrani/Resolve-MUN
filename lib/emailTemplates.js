// Minimal Monochrome HTML Email Template Engine for Resolve MUN 2.0
// Uses the official Resolve MUN banner (public/RESOLVE MUN.svg) at the top.

const BANNER_URL =
  process.env.NEXT_PUBLIC_EMAIL_BANNER_URL ||
  "https://resolvemun.in/RESOLVE%20MUN.svg";

function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildResolveEmailHtml({
  eyebrow = "Resolve MUN 2.0",
  title = "Official Update",
  recipientName = "Delegate",
  bodyText = "",
  ctaLabel = "Open Delegate Dashboard",
  ctaUrl = "https://resolvemun.in/dashboard",
  highlightBox = null,
} = {}) {
  const paragraphs = String(bodyText || "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 14px 0;font-size:14px;line-height:1.68;color:#d4d4d8;">${esc(p).replace(/\n/g, "<br/>")}</p>`
    )
    .join("");

  const highlightHtml = highlightBox
    ? `<div style="margin:20px 0;padding:16px 18px;background:#0a0a0a;border:1px solid #262626;border-radius:6px;">
         ${highlightBox.label ? `<div style="font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#737373;margin-bottom:6px;">${esc(highlightBox.label)}</div>` : ""}
         <div style="font-size:16px;font-weight:700;color:#ffffff;letter-spacing:0.02em;">${esc(highlightBox.value)}</div>
       </div>`
    : "";

  const ctaHtml =
    ctaLabel && ctaUrl
      ? `<div style="margin:24px 0 6px 0;">
           <a href="${esc(ctaUrl)}" style="display:inline-block;padding:11px 22px;background:#ffffff;color:#000000;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;border-radius:6px;">${esc(ctaLabel)}</a>
         </div>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${esc(title)} — Resolve MUN 2.0</title>
</head>
<body style="margin:0;padding:0;background-color:#000000;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#e5e5e5;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#000000;width:100%;margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:32px 16px 48px 16px;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:540px;background-color:#050505;border:1px solid #262626;border-radius:8px;overflow:hidden;">
          <!-- Banner -->
          <tr>
            <td align="center" style="padding:28px 28px 22px 28px;background-color:#000000;border-bottom:1px solid #1f1f1f;">
              <img src="${esc(BANNER_URL)}" alt="RESOLVE MUN 2.0" width="210" style="display:block;max-width:210px;width:100%;height:auto;margin:0 auto 10px auto;" />
              <div style="font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#737373;">
                26, 27 December 2026 &bull; Northfield International School, Hyderabad
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:28px 28px 30px 28px;">
              <div style="font-size:10px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#737373;margin-bottom:8px;">
                ${esc(eyebrow)}
              </div>
              <h1 style="margin:0 0 18px 0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;line-height:1.25;">
                ${esc(title)}
              </h1>
              <p style="margin:0 0 14px 0;font-size:14px;font-weight:600;color:#ffffff;">
                Hi ${esc(recipientName)},
              </p>
              ${paragraphs}
              ${highlightHtml}
              ${ctaHtml}
              <div style="margin-top:26px;padding-top:18px;border-top:1px solid #1f1f1f;font-size:12.5px;color:#8c8c8c;line-height:1.6;">
                Warm regards,<br/>
                <strong style="color:#ffffff;">Secretariat, Resolve MUN 2.0</strong>
              </div>
            </td>
          </tr>

          <!-- Minimal Footer -->
          <tr>
            <td align="center" style="padding:18px 24px;background-color:#000000;border-top:1px solid #1f1f1f;font-size:11px;color:#525252;line-height:1.6;">
              Northfield International School &bull; Kompally, Hyderabad<br/>
              <a href="https://resolvemun.in" style="color:#8c8c8c;text-decoration:none;">resolvemun.in</a> &bull;
              <a href="mailto:resolve.mun@gmail.com" style="color:#8c8c8c;text-decoration:none;">resolve.mun@gmail.com</a> &bull;
              +91 92121 07797
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
