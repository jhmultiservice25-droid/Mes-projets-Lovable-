export type BadgeData = {
  nom: string;
  prenom: string;
  gmail: string;
  fonction: string;
  photo: HTMLImageElement | null;
};

export const QUOTE =
  "\u00AB La RDC exporte depuis longtemps les richesses de son sol. Il est temps qu'elle exporte aussi les richesses de son intelligence. \u00BB";

const BLUE = "#0B3B8C";
const BLUE_DEEP = "#062459";
const ORANGE = "#F07C1E";
const WHITE = "#FFFFFF";

const FONT = (weight: string, size: number) =>
  `${weight} ${size}px "Helvetica Neue", Helvetica, Arial, sans-serif`;

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPhotoCircle(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  cx: number,
  cy: number,
  radius: number,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = "#DCE3F0";
  ctx.fill();
  ctx.clip();
  if (img && img.width > 0) {
    const scale = Math.max((radius * 2) / img.width, (radius * 2) / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
  }
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.lineWidth = radius * 0.06;
  ctx.strokeStyle = ORANGE;
  ctx.stroke();
}

/** Vertical HD participant badge: 1080 x 1620 */
export function drawBadge(canvas: HTMLCanvasElement, data: BadgeData) {
  const W = 1080;
  const H = 1620;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.textBaseline = "top";

  ctx.fillStyle = WHITE;
  ctx.fillRect(0, 0, W, H);

  const headerH = 340;
  const grad = ctx.createLinearGradient(0, 0, W, headerH);
  grad.addColorStop(0, BLUE_DEEP);
  grad.addColorStop(1, BLUE);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, headerH);

  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 14;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(W - 60, 40, 150 + i * 70, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = ORANGE;
  ctx.fillRect(0, headerH - 16, W, 16);

  ctx.textAlign = "center";
  ctx.fillStyle = WHITE;
  ctx.font = FONT("700", 62);
  ctx.fillText("FIKIRI INNOVATION", W / 2, 96);
  ctx.fillText("FESTIVAL 2026", W / 2, 168);
  ctx.font = FONT("500", 32);
  ctx.fillStyle = "#C9D8F2";
  ctx.fillText("Kinshasa \u00B7 25 novembre 2026", W / 2, 252);

  drawPhotoCircle(ctx, data.photo, W / 2, headerH + 210, 190);

  let y = headerH + 430;
  ctx.fillStyle = BLUE_DEEP;
  ctx.font = FONT("700", 58);
  const fullName = `${data.prenom} ${data.nom}`.trim().toUpperCase();
  for (const line of wrapLines(ctx, fullName, W - 140)) {
    ctx.fillText(line, W / 2, y);
    y += 68;
  }

  y += 16;
  ctx.fillStyle = ORANGE;
  ctx.fillRect(W / 2 - 70, y, 140, 8);
  y += 44;

  ctx.fillStyle = "#3A4A66";
  ctx.font = FONT("500", 36);
  for (const line of wrapLines(ctx, data.fonction, W - 160)) {
    ctx.fillText(line, W / 2, y);
    y += 48;
  }

  y += 14;
  ctx.fillStyle = BLUE;
  ctx.font = FONT("500", 32);
  ctx.fillText(data.gmail, W / 2, y);

  y += 80;
  ctx.font = FONT("700", 30);
  const label = "PARTICIPANT OFFICIEL";
  const lw = ctx.measureText(label).width + 80;
  ctx.fillStyle = "#EAF0FB";
  roundRect(ctx, W / 2 - lw / 2, y - 6, lw, 62, 31);
  ctx.fill();
  ctx.fillStyle = BLUE;
  ctx.fillText(label, W / 2, y + 12);

  const quoteTop = H - 420;
  ctx.fillStyle = BLUE_DEEP;
  ctx.fillRect(0, quoteTop, W, H - quoteTop);
  ctx.fillStyle = ORANGE;
  ctx.fillRect(0, quoteTop, W, 10);

  ctx.fillStyle = WHITE;
  ctx.font = FONT("400", 36);
  let qy = quoteTop + 80;
  for (const line of wrapLines(ctx, QUOTE, W - 160)) {
    ctx.fillText(line, W / 2, qy);
    qy += 52;
  }

  ctx.fillStyle = "#93A9CF";
  ctx.font = FONT("500", 26);
  ctx.fillText("fikiri.cd  \u00B7  #FIF2026", W / 2, H - 70);
}

/** Square shareable visual: 1080 x 1080 */
export function drawShareVisual(canvas: HTMLCanvasElement, data: BadgeData) {
  const S = 1080;
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  ctx.textBaseline = "top";

  const grad = ctx.createLinearGradient(0, 0, S, S);
  grad.addColorStop(0, BLUE_DEEP);
  grad.addColorStop(1, BLUE);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 12;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(-40, S + 40, 180 + i * 110, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  ctx.textAlign = "center";
  drawPhotoCircle(ctx, data.photo, S / 2, 250, 150);

  ctx.fillStyle = WHITE;
  ctx.font = FONT("700", 46);
  let y = 440;
  const fullName = `${data.prenom} ${data.nom}`.trim().toUpperCase();
  for (const line of wrapLines(ctx, fullName, S - 160)) {
    ctx.fillText(line, S / 2, y);
    y += 56;
  }
  ctx.fillStyle = "#C9D8F2";
  ctx.font = FONT("400", 30);
  for (const line of wrapLines(ctx, data.fonction, S - 200)) {
    ctx.fillText(line, S / 2, y);
    y += 42;
  }

  ctx.fillStyle = ORANGE;
  ctx.fillRect(S / 2 - 80, y + 20, 160, 8);

  ctx.fillStyle = WHITE;
  ctx.font = FONT("700", 58);
  let cy = y + 80;
  for (const line of wrapLines(ctx, "JE PARTICIPE AU FIKIRI INNOVATION FESTIVAL 2026", S - 140)) {
    ctx.fillText(line, S / 2, cy);
    cy += 70;
  }

  ctx.fillStyle = ORANGE;
  ctx.font = FONT("600", 32);
  ctx.fillText("Kinshasa \u00B7 25 novembre 2026", S / 2, S - 120);
  ctx.fillStyle = "#93A9CF";
  ctx.font = FONT("500", 26);
  ctx.fillText("#FIF2026", S / 2, S - 70);
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas export failed"))),
      type,
      quality,
    );
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function downloadPdf(canvas: HTMLCanvasElement, filename: string) {
  const { jsPDF } = await import("jspdf");
  const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
  const ratio = canvas.height / canvas.width;
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [100, 100 * ratio],
  });
  pdf.addImage(dataUrl, "JPEG", 0, 0, 100, 100 * ratio);
  pdf.save(filename);
}