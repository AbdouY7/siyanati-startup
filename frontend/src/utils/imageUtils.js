export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  if (url.startsWith("/default-") || url.includes("default-avatar")) return url;
  const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:3001/api").replace("/api", "");
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};
