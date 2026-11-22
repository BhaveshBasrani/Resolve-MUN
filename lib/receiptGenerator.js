// Official E-Generated Receipt / Confirmation PDF Printer for Resolve MUN 2.0
// Renders a clean, standalone A4 print document inside an isolated iframe — NEVER a screenshot of the website.

function escapeHtml(val) {
  return String(val ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function printOfficialReceipt({
  ticketId = "RM26-DEL-0000",
  cardHolder = "Registered Delegate",
  email = "",
  phone = "",
  institution = "",
  passCategory = "Delegate Pass",
  amount = 2500,
  utrNumber = "",
  date = new Date(),
  paymentStatus = "Recorded · Pending Verification",
  conferenceDates = "26, 27 December 2026",
  venue = "Northfield International School, Devarayamjal Road, Kompally, Hyderabad 500078",
} = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const numericAmount = typeof amount === "number" ? amount : Number(amount || 0);
  const formattedAmount =
    numericAmount > 0
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(numericAmount)
      : "Waived / Exempt";

  const issuedDate = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date instanceof Date ? date : new Date(date || Date.now()));

  const qrData = encodeURIComponent(
    `RESOLVE-MUN-2.0|ID:${ticketId}|NAME:${cardHolder}|UTR:${utrNumber || "N/A"}`
  );
  const qrUrl = `https://quickchart.io/qr?size=160&margin=1&text=${qrData}`;
  const logoUrl = `${window.location.origin}/images/Logo.svg`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Resolve MUN 2.0 — E-Receipt (${escapeHtml(ticketId)})</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #111111;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 13px;
      line-height: 1.5;
    }
    .sheet {
      max-width: 720px;
      margin: 0 auto;
      padding: 28px 32px;
      border: 1px solid #d4d4d8;
      border-radius: 10px;
      background: #ffffff;
    }
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding-bottom: 18px;
      border-bottom: 2px solid #111111;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand img {
      width: 44px;
      height: 44px;
      object-fit: contain;
      filter: invert(1);
    }
    .brand h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      line-height: 1.1;
    }
    .brand p {
      margin: 3px 0 0 0;
      font-size: 11px;
      color: #52525b;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .doc-meta {
      text-align: right;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: #111111;
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      border-radius: 4px;
    }
    .doc-ref {
      margin: 6px 0 0 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 12px;
      font-weight: 700;
      color: #111111;
    }
    .doc-date {
      margin: 2px 0 0 0;
      font-size: 11px;
      color: #52525b;
    }
    .summary-strip {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin: 20px 0;
      padding: 14px 16px;
      background: #fafafa;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
    }
    .summary-strip .k {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #71717a;
      margin: 0 0 4px 0;
    }
    .summary-strip .v {
      font-size: 13px;
      font-weight: 700;
      color: #111111;
      margin: 0;
      word-break: break-word;
    }
    .section-title {
      margin: 22px 0 10px 0;
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #52525b;
    }
    table.details {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 18px;
    }
    table.details tr {
      border-bottom: 1px solid #ececef;
    }
    table.details th {
      text-align: left;
      padding: 9px 0;
      width: 36%;
      font-size: 12px;
      font-weight: 500;
      color: #52525b;
    }
    table.details td {
      text-align: right;
      padding: 9px 0;
      font-size: 12.5px;
      font-weight: 600;
      color: #111111;
      word-break: break-word;
    }
    .fee-box {
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      overflow: hidden;
      margin-top: 8px;
    }
    .fee-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      border-bottom: 1px solid #ececef;
      font-size: 12.5px;
    }
    .fee-row.total {
      border-bottom: none;
      background: #111111;
      color: #ffffff;
      font-size: 14px;
      font-weight: 700;
    }
    .bottom-grid {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      margin-top: 24px;
      padding-top: 18px;
      border-top: 1px dashed #d4d4d8;
    }
    .notes {
      flex: 1;
      font-size: 11px;
      color: #52525b;
      line-height: 1.6;
    }
    .notes p {
      margin: 0 0 6px 0;
    }
    .notes strong {
      color: #111111;
    }
    .qr-box {
      text-align: center;
      flex-shrink: 0;
    }
    .qr-box img {
      width: 88px;
      height: 88px;
      border: 1px solid #e4e4e7;
      border-radius: 6px;
      padding: 4px;
      background: #ffffff;
    }
    .qr-box span {
      display: block;
      margin-top: 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 9px;
      color: #71717a;
      letter-spacing: 0.06em;
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div class="brand">
        <img src="${escapeHtml(logoUrl)}" alt="Resolve MUN" onerror="this.style.display='none'" />
        <div>
          <h1>RESOLVE MUN 2.0</h1>
          <p>Official Registration E-Receipt</p>
        </div>
      </div>
      <div class="doc-meta">
        <span class="badge">E-RECEIPT</span>
        <p class="doc-ref">${escapeHtml(ticketId)}</p>
        <p class="doc-date">Issued: ${escapeHtml(issuedDate)}</p>
      </div>
    </div>

    <div class="summary-strip">
      <div>
        <p class="k">Applicant</p>
        <p class="v">${escapeHtml(cardHolder)}</p>
      </div>
      <div>
        <p class="k">Category</p>
        <p class="v">${escapeHtml(passCategory)}</p>
      </div>
      <div>
        <p class="k">Amount Paid</p>
        <p class="v">${escapeHtml(formattedAmount)}</p>
      </div>
    </div>

    <p class="section-title">Registration &amp; Payment Details</p>
    <table class="details">
      <tr>
        <th>Reference ID</th>
        <td style="font-family: monospace;">${escapeHtml(ticketId)}</td>
      </tr>
      <tr>
        <th>Applicant Name</th>
        <td>${escapeHtml(cardHolder)}</td>
      </tr>
      ${email ? `<tr><th>Email Address</th><td>${escapeHtml(email)}</td></tr>` : ""}
      ${phone ? `<tr><th>Contact Number</th><td>${escapeHtml(phone)}</td></tr>` : ""}
      ${institution ? `<tr><th>Institution</th><td>${escapeHtml(institution)}</td></tr>` : ""}
      <tr>
        <th>Payment Method</th>
        <td>UPI Transfer</td>
      </tr>
      <tr>
        <th>UPI UTR / Transaction ID</th>
        <td style="font-family: monospace;">${escapeHtml(utrNumber || "N/A")}</td>
      </tr>
      <tr>
        <th>Status</th>
        <td>${escapeHtml(paymentStatus)}</td>
      </tr>
      <tr>
        <th>Conference Dates</th>
        <td>${escapeHtml(conferenceDates)}</td>
      </tr>
      <tr>
        <th>Official Venue</th>
        <td>${escapeHtml(venue)}</td>
      </tr>
    </table>

    <p class="section-title">Fee Summary</p>
    <div class="fee-box">
      <div class="fee-row">
        <span>${escapeHtml(passCategory)} Fee</span>
        <strong>${escapeHtml(formattedAmount)}</strong>
      </div>
      <div class="fee-row total">
        <span>Total Paid</span>
        <span>${escapeHtml(formattedAmount)}</span>
      </div>
    </div>

    <div class="bottom-grid">
      <div class="notes">
        <p><strong>Important Notice:</strong> This is an electronically generated confirmation receipt from Resolve Model United Nations 2.0 and does not require a physical signature.</p>
        <p>Registration fees are non-refundable. Present your Digital Gate Pass (available on <strong>resolvemun.in/dashboard</strong>) along with a valid school/college ID at check-in.</p>
        <p>Secretariat Support: <strong>resolve.mun@gmail.com</strong> &bull; <strong>+91 92121 07797</strong></p>
      </div>
      <div class="qr-box">
        <img src="${qrUrl}" alt="Verification QR" />
        <span>${escapeHtml(ticketId)}</span>
      </div>
    </div>
  </div>
</body>
</html>`;

  // Print via an isolated hidden iframe so the browser prints ONLY this clean A4 receipt (never a screenshot of the site)
  const existing = document.getElementById("resolve-receipt-print-frame");
  if (existing) existing.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "resolve-receipt-print-frame";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();

  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (_) {
      window.print();
    }
    setTimeout(() => {
      try {
        iframe.remove();
      } catch (_) {}
    }, 3000);
  };

  // Give images (QR & logo) a brief moment to load before invoking print dialog
  setTimeout(triggerPrint, 450);
}

// Download ONLY the QR Gate Pass as a crisp PNG image straight to device gallery/downloads
export async function downloadQrPassImage({
  ticketId = "RM26-DEL-0000",
  cardHolder = "Registered Delegate",
  roleType = "DELEGATE",
  email = "",
} = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const qrPayload = `RESOLVE_PASS:${String(roleType || "DELEGATE").toUpperCase()}:${ticketId}:${email}`;
  const qrUrl = `https://quickchart.io/qr?size=600&margin=2&format=png&text=${encodeURIComponent(qrPayload)}`;
  const safeId = String(ticketId || "PASS").replace(/[^a-zA-Z0-9_-]/g, "");
  const fileName = `ResolveMUN-QR-${safeId}.png`;

  try {
    const res = await fetch(qrUrl, { mode: "cors" });
    if (!res.ok) throw new Error("QR fetch failed");
    const blob = await res.blob();
    const imgUrl = URL.createObjectURL(blob);

    await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 760;
          canvas.height = 960;
          const ctx = canvas.getContext("2d");

          // Pure black background + sharp white border
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 4;
          ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

          // Top header
          ctx.fillStyle = "#a3a3a3";
          ctx.font = "600 20px Inter, system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("RESOLVE MUN 2.0  ·  OFFICIAL GATE PASS", canvas.width / 2, 86);

          ctx.fillStyle = "#ffffff";
          ctx.font = "700 34px Inter, system-ui, sans-serif";
          ctx.fillText(String(cardHolder || "Delegate").slice(0, 28), canvas.width / 2, 138);

          // Crisp white QR frame
          const qrBox = 520;
          const qrX = (canvas.width - qrBox) / 2;
          const qrY = 185;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(qrX, qrY, qrBox, qrBox);
          ctx.drawImage(img, qrX + 20, qrY + 20, qrBox - 40, qrBox - 40);

          // Bottom Delegate ID & Venue
          ctx.fillStyle = "#ffffff";
          ctx.font = "700 28px ui-monospace, Menlo, Consolas, monospace";
          ctx.fillText(String(ticketId), canvas.width / 2, 775);

          ctx.fillStyle = "#a3a3a3";
          ctx.font = "500 20px Inter, system-ui, sans-serif";
          ctx.fillText("Northfield International School · 26, 27 Dec 2026", canvas.width / 2, 830);

          ctx.fillStyle = "#737373";
          ctx.font = "600 16px ui-monospace, Menlo, Consolas, monospace";
          ctx.fillText(`${String(roleType || "DELEGATE").toUpperCase()} ENTRY QR`, canvas.width / 2, 882);

          canvas.toBlob((outBlob) => {
            if (!outBlob) {
              reject(new Error("Canvas export failed"));
              return;
            }
            const dlUrl = URL.createObjectURL(outBlob);
            const a = document.createElement("a");
            a.href = dlUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => {
              URL.revokeObjectURL(dlUrl);
              URL.revokeObjectURL(imgUrl);
            }, 1500);
            resolve();
          }, "image/png");
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = reject;
      img.src = imgUrl;
    });
  } catch (_) {
    // Fallback: open raw QR image directly so user can save it
    window.open(qrUrl, "_blank", "noopener,noreferrer");
  }
}

// Print / Save PDF of ONLY the QR Gate Pass (zero website chrome, zero receipt clutter)
export function printQrPassPdf({
  ticketId = "RM26-DEL-0000",
  cardHolder = "Registered Delegate",
  roleType = "DELEGATE",
  email = "",
  committee = "",
} = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const qrPayload = `RESOLVE_PASS:${String(roleType || "DELEGATE").toUpperCase()}:${ticketId}:${email}`;
  const qrUrl = `https://quickchart.io/qr?size=420&margin=1&text=${encodeURIComponent(qrPayload)}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Resolve MUN 2.0 — QR Gate Pass (${escapeHtml(ticketId)})</title>
  <style>
    @page { size: A4 portrait; margin: 18mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body {
      margin: 0;
      min-height: 92vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      color: #000000;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .pass {
      width: 360px;
      border: 2px solid #000000;
      border-radius: 8px;
      padding: 28px 24px;
      text-align: center;
      background: #ffffff;
    }
    .eyebrow {
      margin: 0;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #52525b;
    }
    .name {
      margin: 8px 0 4px 0;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.01em;
      color: #000000;
    }
    .role {
      display: inline-block;
      margin: 4px 0 20px 0;
      padding: 3px 10px;
      background: #000000;
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      border-radius: 4px;
    }
    .qr-wrap {
      display: inline-block;
      padding: 12px;
      border: 1.5px solid #000000;
      border-radius: 6px;
      background: #ffffff;
    }
    .qr-wrap img {
      width: 240px;
      height: 240px;
      display: block;
    }
    .id {
      margin: 18px 0 6px 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #000000;
    }
    .meta {
      margin: 0;
      font-size: 11px;
      color: #3f3f46;
      line-height: 1.55;
    }
  </style>
</head>
<body>
  <div class="pass">
    <p class="eyebrow">RESOLVE MUN 2.0 · ENTRY QR</p>
    <h1 class="name">${escapeHtml(cardHolder)}</h1>
    <span class="role">${escapeHtml(String(roleType || "DELEGATE").toUpperCase())} PASS</span>
    <div>
      <div class="qr-wrap">
        <img src="${qrUrl}" alt="Gate Pass QR Code" />
      </div>
    </div>
    <p class="id">${escapeHtml(ticketId)}</p>
    ${committee ? `<p class="meta"><strong>${escapeHtml(committee)}</strong></p>` : ""}
    <p class="meta">Northfield International School, Hyderabad<br/>26, 27 December 2026</p>
  </div>
</body>
</html>`;

  const existing = document.getElementById("resolve-qr-print-frame");
  if (existing) existing.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "resolve-qr-print-frame";
  iframe.style.position = "fixed";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (_) {
      window.print();
    }
    setTimeout(() => {
      try {
        iframe.remove();
      } catch (_) {}
    }, 3000);
  }, 450);
}
