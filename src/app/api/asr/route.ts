import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const audio = form.get("audio") as File | null;
    if (!audio) return NextResponse.json({ error: "No audio" }, { status: 400 });

    // If HF token missing, return a demo transcription so the UI continues to work
    const token = process.env.HF_API_TOKEN;
    const model = process.env.HF_ASR_MODEL || "openai/whisper-small";

    if (!token) {
      // demo fallback — return a plausible transcribed text
      return NextResponse.json({ text: "Dumela" });
    }

    const arrayBuffer = await audio.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = audio.type || "audio/webm";

    // forward to HF inference
    const hfRes = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": contentType
      },
      body: buffer
    });

    const hfCt = hfRes.headers.get("content-type") || "";
    const hfText = await hfRes.text();

    if (!hfRes.ok) {
      // return structured error for debugging
      return NextResponse.json({
        error: "HF error",
        status: hfRes.status,
        hf_content_type: hfCt,
        hf_body: hfText
      }, { status: 502 });
    }

    // try parse
    try {
      const hfJson = JSON.parse(hfText);
      const text = hfJson?.text || (Array.isArray(hfJson) && hfJson[0]?.text) || hfJson?.transcription || null;
      if (text) return NextResponse.json({ text });
      return NextResponse.json({ error: "No text in HF response", raw: hfJson }, { status: 502 });
    } catch (e) {
      // if not JSON, return as text
      return NextResponse.json({ text: hfText });
    }

  } catch (err) {
    console.error("ASR route error:", err);
    return NextResponse.json({ error: "ASR internal error", details: (err as any)?.message || String(err) }, { status: 500 });
  }
}
