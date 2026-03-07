import { promises as fs } from "node:fs";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import {
  getMusicAudioFilePath,
  isValidMusicFileId,
} from "@/lib/music-interactive";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await params;

  if (!isValidMusicFileId(fileId)) {
    return NextResponse.json({ error: "Audio file not found." }, { status: 404 });
  }

  const filePath = getMusicAudioFilePath(fileId);

  try {
    const stat = await fs.stat(filePath);
    const stream = createReadStream(filePath);

    return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
      headers: {
        "content-type": "audio/wav",
        "content-length": stat.size.toString(),
        "cache-control": "no-store",
        "content-disposition": `inline; filename="${fileId}.wav"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Audio file not found." }, { status: 404 });
  }
}
