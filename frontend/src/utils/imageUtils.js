const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("data:")) return url;
  if (url.startsWith("/default-") || url.includes("default-avatar")) return url;

  // Proxy Cloudinary URLs through the backend to avoid
  // browser tracking prevention (Edge, Brave, Firefox strict)
  if (url.includes("cloudinary.com")) {
    return `${apiBase}/proxy/image?url=${encodeURIComponent(url)}`;
  }

  if (url.startsWith("http")) return url;

  const baseUrl = apiBase.replace("/api", "");
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

