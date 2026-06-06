import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  await writeFile(join(uploadDir, filename), buffer);

  return Response.json({
    filename,
    name: file.name,
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString(),
    url: `/uploads/${filename}`,
  });
}
