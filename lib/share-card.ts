import type { GeneratedPlan } from "@/lib/generate-plan";

/**
 * Render a 1080×1920 portrait card of the user's week into an offscreen
 * canvas, then trigger a PNG download. Designed to feel like a physical
 * artefact — same palette and editorial typography as the page.
 */
export function downloadPlanCard(plan: GeneratedPlan) {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // background
  ctx.fillStyle = "#f6f3ec";
  ctx.fillRect(0, 0, W, H);

  // soft coral halo top-right
  const grad = ctx.createRadialGradient(W * 0.78, H * 0.18, 0, W * 0.78, H * 0.18, W * 0.7);
  grad.addColorStop(0, "rgba(225, 106, 79, 0.35)");
  grad.addColorStop(0.4, "rgba(243, 166, 133, 0.12)");
  grad.addColorStop(1, "rgba(243, 166, 133, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.textBaseline = "top";

  // top brand line
  ctx.fillStyle = "#8a8478";
  ctx.font = "500 22px 'Inter Tight', system-ui, sans-serif";
  ctx.fillText("LIFEDESIGNER", 80, 80);

  // small coral pip
  ctx.beginPath();
  ctx.arc(60, 92, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#e16a4f";
  ctx.fill();

  // headline
  ctx.fillStyle = "#1c1917";
  ctx.font = "500 116px 'Inter Tight', system-ui, sans-serif";
  ctx.fillText("this", 80, 200);

  ctx.fillStyle = "#5a564f";
  ctx.font = "400 116px 'Inter Tight', system-ui, sans-serif";
  ctx.fillText("week, for you.", 80, 320);

  // intent quote
  ctx.fillStyle = "#5a564f";
  ctx.font = "italic 28px 'Inter Tight', system-ui, sans-serif";
  const intent = `“${plan.intent}”`;
  wrapText(ctx, intent, 80, 520, W - 160, 38);

  // days — clean editorial grid, vertically stacked
  let y = 660;
  const dayHeight = 130;
  const gutter = 18;

  ctx.fillStyle = "#e6e0d2";
  ctx.fillRect(80, y - 24, W - 160, 1);

  for (const d of plan.days) {
    // day label
    ctx.fillStyle = "#8a8478";
    ctx.font = "500 18px 'Inter Tight', system-ui, sans-serif";
    ctx.fillText(d.day.toUpperCase(), 80, y);
    ctx.fillText(d.num, W - 80 - ctx.measureText(d.num).width, y);

    // today underline
    if (d.isToday) {
      ctx.fillStyle = "#e16a4f";
      ctx.fillRect(80, y - 18, 36, 3);
    }

    // items
    let itemY = y + 36;
    ctx.fillStyle = "#1c1917";
    ctx.font = "400 24px 'Inter Tight', system-ui, sans-serif";
    for (const item of d.items) {
      ctx.fillStyle = "#8a8478";
      ctx.font = "400 18px 'Inter Tight', system-ui, sans-serif";
      ctx.fillText(item.time, 80, itemY + 4);

      ctx.fillStyle = "#1c1917";
      ctx.font = "400 24px 'Inter Tight', system-ui, sans-serif";
      ctx.fillText(item.text, 200, itemY);
      itemY += 36;
    }

    y += dayHeight + gutter;

    ctx.fillStyle = "#e6e0d2";
    ctx.fillRect(80, y - gutter / 2, W - 160, 1);

    if (y > H - 220) break;
  }

  // footer signature
  ctx.fillStyle = "#8a8478";
  ctx.font = "500 18px 'Inter Tight', system-ui, sans-serif";
  ctx.fillText("MADE SLOWLY · LIFEDESIGNER · 2026", 80, H - 80);

  // accent dot bottom-right
  ctx.beginPath();
  ctx.arc(W - 100, H - 76, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#e16a4f";
  ctx.fill();

  // download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-week-${plan.archetype}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }, "image/png");
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let curY = y;
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + " ";
    if (ctx.measureText(test).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, curY);
      line = words[i] + " ";
      curY += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, curY);
}
