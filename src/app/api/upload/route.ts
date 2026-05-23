import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const name = `upload_${Date.now()}.${ext}`;
  const dest = path.join(process.cwd(), "public", "images", name);
  fs.writeFileSync(dest, buffer);

  return NextResponse.json({ url: `/images/${name}` });
}
