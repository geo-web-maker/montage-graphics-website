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

  // data.colors looks like [["#3d7fff", 42.1], ["#121316", 31.7], ...],
  // sorted by how much of the image each color covers — [0][0] is the
  // single most dominant hex.
  const dominantColor = data.colors?.[0]?.[0] ?? null;

  return {
    url: data.secure_url,
    width: data.width,
    height: data.height,
    dominantColor,
  };
}
