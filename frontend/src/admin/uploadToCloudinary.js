import { getUploadSignature } from "../api/client";

// The file never touches our FastAPI server — we only ask it for a signed
// signature, then POST the file straight to Cloudinary's own endpoint.
export async function uploadToCloudinary(token, file) {
  const { timestamp, signature, api_key, cloud_name, folder } =
    await getUploadSignature(token);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", api_key);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(errBody?.error?.message || "Cloudinary upload failed");
  }

  const data = await res.json();
  return data.secure_url; // this is what gets saved to Mongo as logo_url / image_url
}
