import { NextResponse } from 'next/server';
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const audio = form.get('audio') as File;
    if (!audio) return NextResponse.json({ error: 'No audio' }, { status: 400 });
    const array = await audio.arrayBuffer();
    const model = process.env.HF_ASR_MODEL || 'openai/whisper-small';
    const token = process.env.HF_API_TOKEN;
    const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, { method: 'POST', headers: token ? { 'Authorization': `Bearer ${token}` } : {}, body: array });
    const data = await res.json();
    const text = data?.text || data?.[0]?.text || data?.transcription || null;
    if (!text) return NextResponse.json({ error: 'Transcription empty', raw: data }, { status: 500 });
    return NextResponse.json({ text });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'ASR error' }, { status: 500 });
  }
}
