import { NextResponse } from 'next/server';
import fs from 'fs';
const PHRASE_PATH = './src/app/data/phrasebook.json';
function normalize(s:any){ return s ? s.toString().trim().toLowerCase() : ''; }
export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if(!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    const phrases = fs.existsSync(PHRASE_PATH) ? JSON.parse(fs.readFileSync(PHRASE_PATH,'utf8')) : [];
    const normText = normalize(text);
    let match = phrases.find((p:any)=> normalize(p.en) === normText || normalize(p.tsn) === normText);
    if(match){ const translation = normalize(text) === normalize(match.tsn) ? match.en : match.tsn; return NextResponse.json({ translation }); }
    match = phrases.find((p:any)=> normalize(p.en).includes(normText) || normalize(p.tsn).includes(normText));
    if(match){ const translation = normalize(text) === normalize(match.tsn) ? match.en : match.tsn; return NextResponse.json({ translation }); }
    const model = process.env.HF_MT_MODEL || 'facebook/nllb-200-distilled-600M';
    const token = process.env.HF_API_TOKEN;
    try {
      const payload = { inputs: text };
      const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, { method: 'POST', headers: token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      const out = Array.isArray(data) && data[0] && (data[0].translation_text || data[0].generated_text) ? (data[0].translation_text || data[0].generated_text) : (data.translation_text || (typeof data==='string' ? data : null));
      if(out) return NextResponse.json({ translation: out });
    } catch(e){ console.error('HF fallback failed', e); }
    return NextResponse.json({ error: 'Translation not found. Enable HF_API_TOKEN for fallback.' }, { status: 404 });
  } catch(e){ console.error(e); return NextResponse.json({ error: 'MT error' }, { status: 500 }); }
}
