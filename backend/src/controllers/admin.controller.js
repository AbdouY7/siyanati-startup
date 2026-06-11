/**
 * Admin Dashboard Controller
 * ─────────────────────────────────────────────────────────────────────
 * Thin controller layer — all DB logic lives in services/stats.service.js
 */
const { getDashboardStats, CACHE_KEY } = require("../services/stats.service");
const { clearCache } = require("../utils/cache");
const prisma = require("../prisma/client");
const fs = require("fs");
const path = require("path");

const backendRoot = path.resolve(__dirname, "../..");
const configuredDocumentRoot =
  process.env.DOCUMENTS_DIR || process.env.UPLOADS_DIR || process.env.ADMIN_DOCUMENTS_DIR;
const documentRoots = [
  configuredDocumentRoot,
  path.join(backendRoot, "uploads"),
  path.join(backendRoot, "documents"),
]
  .filter(Boolean)
  .map((root) => path.resolve(root));

const inlineMimeTypes = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const stripKnownDocumentRootPrefix = (documentPath) =>
  documentPath.replace(/^\/+/, "").replace(/^(uploads|documents)\//, "");

const getAllowedMimeType = (value) => {
  const pathname = /^https?:\/\//i.test(value) ? new URL(value).pathname : value;
  return inlineMimeTypes[path.extname(pathname).toLowerCase()] || null;
};

const isStoredDocument = async (documentPath) => {
  const [storeProfile, professionalProfile, professionalStore] =
    await prisma.$transaction([
      prisma.storeProfile.findFirst({
        where: { documents: { has: documentPath } },
        select: { id: true },
      }),
      prisma.professionalProfile.findFirst({
        where: { documents: { has: documentPath } },
        select: { id: true },
      }),
      prisma.professionalStore.findFirst({
        where: { documents: { has: documentPath } },
        select: { id: true },
      }),
    ]);

  return Boolean(storeProfile || professionalProfile || professionalStore);
};

const resolveStoredDocumentPath = (documentPath) => {
  const normalizedInput = String(documentPath).replace(/\\/g, "/");

  // Only serve document formats admins are expected to review inline.
  const extension = path.extname(normalizedInput).toLowerCase();
  if (!inlineMimeTypes[extension]) return null;

  const candidatePaths = path.isAbsolute(documentPath)
    ? [path.resolve(documentPath)]
    : documentRoots.map((root) =>
        path.resolve(root, stripKnownDocumentRootPrefix(normalizedInput)),
      );

  return candidatePaths.find((candidate) => {
    // Directory traversal guard: every resolved file must stay inside one of the
    // configured private document roots before Express is allowed to stream it.
    const isInsideAllowedRoot = documentRoots.some((root) => {
      const relative = path.relative(root, candidate);
      return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
    });

    return isInsideAllowedRoot && fs.existsSync(candidate);
  });
};

// GET /api/admin/dashboard/overview
const getDashboardOverview = async (req, res, next) => {
  try {
    const data = await getDashboardStats();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error in getDashboardOverview:", error);
    next(error);
  }
};

// POST /api/admin/dashboard/refresh  — busts cache and returns fresh data
const refreshDashboard = async (req, res, next) => {
  try {
    clearCache(CACHE_KEY);
    console.log("[Dashboard] Cache cleared via manual refresh");
    const data = await getDashboardStats();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error in refreshDashboard:", error);
    next(error);
  }
};

// GET /api/admin/documents/view?path=<stored document path>
const viewAdminDocument = async (req, res, next) => {
  try {
    const documentPath = req.query.path;

    if (!documentPath || typeof documentPath !== "string") {
      return res.status(400).json({ success: false, message: "Document path is required" });
    }

    const isStored = await isStoredDocument(documentPath);
    if (!isStored) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    if (documentPath.includes("\0")) {
      return res.status(400).json({ success: false, message: "Invalid document path" });
    }

    if (/^https?:\/\//i.test(documentPath)) {
      const mimeType = getAllowedMimeType(documentPath);
      if (!mimeType) {
        return res.status(415).json({ success: false, message: "Unsupported document type" });
      }

      const upstreamResponse = await fetch(documentPath);
      if (!upstreamResponse.ok) {
        return res.status(404).json({ success: false, message: "Document file not found" });
      }

      const upstreamContentType = upstreamResponse.headers.get("content-type") || "";
      if (
        upstreamContentType &&
        !upstreamContentType.includes("application/pdf") &&
        !upstreamContentType.startsWith("image/")
      ) {
        return res.status(415).json({ success: false, message: "Unsupported document response" });
      }

      const fileBuffer = Buffer.from(await upstreamResponse.arrayBuffer());
      const filename = path.basename(new URL(documentPath).pathname) || "document";

      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      res.setHeader("X-Content-Type-Options", "nosniff");
      return res.send(fileBuffer);
    }

    const filePath = resolveStoredDocumentPath(documentPath);
    if (!filePath) {
      return res.status(404).json({ success: false, message: "Document file not found" });
    }

    const mimeType = inlineMimeTypes[path.extname(filePath).toLowerCase()];

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${path.basename(filePath)}"`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    return res.sendFile(filePath);
  } catch (error) {
    console.error("Error in viewAdminDocument:", error);
    next(error);
  }
};

module.exports = { getDashboardOverview, refreshDashboard, viewAdminDocument };
