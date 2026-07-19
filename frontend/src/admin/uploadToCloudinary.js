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
  // Two things follow from that:
  //   1. The dominant entry is very likely the transparent canvas itself
  //      (e.g. "#00000000") since it covers the most pixels — not the
  //      actual artwork. Skip fully/mostly transparent and near-black/
  //      near-white entries, and use the first genuinely visible,
  //      saturated color instead.
  //   2. Whatever hex we DO pick must be normalized to a plain 6-digit
  //      "#RRGGBB" before it's saved — WorkCarousel.jsx appends its own
  //      alpha suffix ("55") for the gradient tint, and appending that to
  //      an already-8-digit hex produces a 10-digit value, which isn't
  //      valid CSS and gets silently dropped by the browser.
  const parseColor = (hex) => {
    const clean = hex.replace("#", "");
    const hasAlpha = clean.length === 8;
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    const a = hasAlpha ? parseInt(clean.slice(6, 8), 16) : 255;
    return { r, g, b, a, rgbHex: `#${clean.slice(0, 6)}` };
  };
  const isUsable = ({ r, g, b, a }) => {
    if (a < 128) return false; // mostly/fully transparent — not real artwork
    const lightness = (Math.max(r, g, b) + Math.min(r, g, b)) / 2 / 255;
    return lightness >= 0.12 && lightness <= 0.92;
  };
  const parsedColors = (data.colors ?? []).map(([hex]) => parseColor(hex));
  const dominantColor =
    parsedColors.find(isUsable)?.rgbHex ?? parsedColors[0]?.rgbHex ?? null;

  return {
    url: data.secure_url,
    width: data.width,
    height: data.height,
    dominantColor,
  };
}
