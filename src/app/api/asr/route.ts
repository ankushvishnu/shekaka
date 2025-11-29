import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const audio = form.get("audio") as File | null;
    if (!audio) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 });
    }

    // Read the audio bytes
    const arrayBuffer = await audio.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine a sensible content type to forward
    const contentType = audio.type && audio.type.length ? audio.type : "audio/webm";

    const model = process.env.HF_ASR_MODEL || "openai/whisper-small";
    const token = process.env.HF_API_TOKEN;

    // Build fetch headers (include content-type)
    const headers: Record<string, string> = {
      "Content-Type": contentType,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Forward binary audio to HF Inference API
    const hfRes = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers,
      body: buffer,
    });

    // If HF replied non-JSON (html or text), fallback gracefully
    const hfContentType = hfRes.headers.get("content-type") || "";

    if (!hfRes.ok) {
      // try to read json
      if (hfContentType.includes("application/json")) {
        const errJson = await hfRes.json();
        return NextResponse.json({ error: "HF error", details: errJson }, { status: hfRes.status });
      } else {
        const errText = await hfRes.text();
        return NextResponse.json({ error: "HF returned error", details: errText }, { status: hfRes.status });
      }
    }

    // parse HF result to find transcribed text
    if (hfContentType.includes("application/json")) {
      const data = await hfRes.json();
      // different HF models / endpoints return different shapes; try multiple
      const text = data?.text || (Array.isArray(data) && data[0]?.text) || data?.transcription || data?.results?.[0]?.text || null;
      if (!text) {
        // safe fallback: return whole response for debugging
        return NextResponse.json({ error: "No transcription in HF response", raw: data }, { status: 502 });
      }
      return NextResponse.json({ text });
    } else {
      // non-json but ok (rare) — return text
      const txt = await hfRes.text();
      // if it's plain text, return as text field
      return NextResponse.json({ text: txt });
    }
  } catch (e) {
    console.error("ASR route error:", e);
    return NextResponse.json({ error: "ASR internal error", details: (e as any)?.message || String(e) }, { status: 500 });
  }
}
