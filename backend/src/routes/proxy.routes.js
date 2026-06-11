const express = require("express");
const router = express.Router();

/**
 * GET /api/proxy/image?url=<cloudinary_url>
 *
 * Proxies Cloudinary images through the backend so they appear
 * as same-origin resources to the browser, avoiding tracking
 * prevention blocks from Edge / Brave / Firefox strict mode.
 */
router.get("/image", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ message: "Missing 'url' query parameter" });
  }

  // Only allow proxying from Cloudinary for security
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith("cloudinary.com")) {
      return res.status(403).json({ message: "Only Cloudinary URLs are allowed" });
    }
  } catch {
    return res.status(400).json({ message: "Invalid URL" });
  }

  try {
    let upstream = await fetch(url);

    // Cloudinary blocks PDF delivery by default on new accounts for security.
    // If it returns 401 for a PDF, try to fetch the first page as a PNG image instead.
    if (upstream.status === 401 && url.toLowerCase().endsWith('.pdf')) {
      const pngUrl = url.slice(0, -4) + '.png';
      upstream = await fetch(pngUrl);
    }

    if (!upstream.ok) {
      return res.status(upstream.status).json({ message: "Upstream fetch failed", status: upstream.status });
    }

    // Forward content-type
    const contentType = upstream.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);

    // Override Helmet's restrictive headers so <img> tags can load this
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.removeHeader("Cross-Origin-Embedder-Policy");
    res.removeHeader("Cross-Origin-Opener-Policy");
    res.removeHeader("Content-Security-Policy");
    res.removeHeader("X-Content-Type-Options");

    // Cache proxied images for 1 hour on client, 1 day on CDN
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");

    // Pipe the response body
    const buffer = await upstream.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("Image proxy error:", err.message);
    res.status(502).json({ message: "Failed to fetch image from upstream" });
  }
});

module.exports = router;
