import { getUploadSignature } from "../api/client";

// The file never touches our FastAPI server — we only ask it for a signed
// signature, then POST the file straight to Cloudinary's own endpoint.
//
// forLogo=true also requests Cloudinary's color analysis, so the response
// includes a `colors` array we can pull a dominant hex from — used for the
// client logo's background-tint effect. Regular work-image uploads don't
// need this, so it stays off by default.
export async function uploadToCloudinary(token, file, { forLogo = false } = {}) {
  const { timestamp, signature, api_key, cloud_name, folder, colors } =
    await getUploadSignature(token, { forLogo });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", api_key);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);
  if (colors) formData.append("colors", colors);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(errBody?.error?.message || "Cloudinary upload failed");
  }

  const data = await res.json();

  // data.colors looks like [["#3d7fff", 42.1], ["#121316", 31.7], ...] —
  // BUT: per Cloudinary's own docs, if the image has any transparency
  // (true for basically every client logo — an icon on a transparent
  // canvas), entries come back as 8-digit RRGGBBAA hex, not 6-digit RGB.
  //   1. Whatever hex we pick must be normalized to a plain 6-digit
  //      "#RRGGBB" before it's saved — WorkCarousel.jsx appends its own
  //      alpha suffix ("55") for the gradient tint, and appending that to
  //      an already-8-digit hex produces a 10-digit value, which isn't
  //      valid CSS and gets silently dropped by the browser.
  //   2. "Not transparent and not near-black/near-white" isn't enough on
  //      its own — a logo's dark outline strokes are opaque and can land
  //      right at the edge of that lightness range, but they're still
  //      just gray (near-zero saturation), not the brand color. Instead
  //      of taking the first entry that merely clears the lightness bar,
  //      require real saturation and pick whichever *usable* candidate is
  //      most saturated — that's the actual color a person would call
  //      "the logo's color," not just whatever covers the most pixels.
  const parseColor = (hex) => {
    const clean = hex.replace("#", "");
    const hasAlpha = clean.length === 8;
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    const a = hasAlpha ? parseInt(clean.slice(6, 8), 16) : 255;
    const max = Math.max(r, g, b) / 255, min = Math.min(r, g, b) / 255;
    const lightness = (max + min) / 2;
    const saturation =
      max === min ? 0 : lightness < 0.5
        ? (max - min) / (max + min)
        : (max - min) / (2 - max - min);
    return { a, lightness, saturation, rgbHex: `#${clean.slice(0, 6)}` };
  };
  const isUsable = ({ a, lightness }) =>
    a >= 128 && lightness >= 0.12 && lightness <= 0.92;

  const parsedColors = (data.colors ?? []).map(([hex]) => parseColor(hex));
  const usableColors = parsedColors.filter(isUsable);
  const mostSaturated = usableColors.length
    ? usableColors.reduce((best, c) => (c.saturation > best.saturation ? c : best))
    : null;
  const dominantColor =
    (mostSaturated && mostSaturated.saturation >= 0.2 ? mostSaturated.rgbHex : null) ??
    usableColors[0]?.rgbHex ??
    parsedColors[0]?.rgbHex ??
    null;

  return {
    url: data.secure_url,
    width: data.width,
    height: data.height,
    dominantColor,
  };
}
