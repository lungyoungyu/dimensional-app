import { readdir, stat } from "fs/promises";
import { join, extname } from "path";

function mimeFromExt(filename: string): string {
  const ext = extname(filename).toLowerCase();
  const map: Record<string, string> = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".csv": "text/csv",
    ".json": "application/json",
    ".ts": "text/plain",
    ".tsx": "text/plain",
    ".js": "text/plain",
    ".html": "text/html",
  };
  return map[ext] ?? "application/octet-stream";
}

export async function GET() {
  const uploadDir = join(process.cwd(), "public", "uploads");
  try {
    const entries = await readdir(uploadDir);
    const files = await Promise.all(
      entries
        .filter((f) => !f.startsWith("."))
        .map(async (filename) => {
          const s = await stat(join(uploadDir, filename));
          const name = filename.replace(/^\d+-/, "");
          return {
            filename,
            name,
            size: s.size,
            type: mimeFromExt(name),
            uploadedAt: s.birthtime.toISOString(),
            url: `/uploads/${filename}`,
          };
        })
    );
    return Response.json(
      files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    );
  } catch {
    return Response.json([]);
  }
}
