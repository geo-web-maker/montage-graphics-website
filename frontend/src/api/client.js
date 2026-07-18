const BASE_URL = import.meta.env.VITE_API_URL;

export async function getClients() {
  const res = await fetch(`${BASE_URL}/clients`);
  if (!res.ok) throw new Error("Failed to load clients");
  return res.json();
}

export async function getClientWork(slug) {
  const res = await fetch(`${BASE_URL}/clients/${slug}/work`);
  if (!res.ok) throw new Error("Failed to load work images");
  return res.json();
}