import { NextResponse } from 'next/server';
import fs from 'fs';
const FEEDBACK_PATH = './feedback.json';
const PHRASE_PATH = './src/app/data/phrasebook.json';
export async function POST(req: Request) {
  try {
    const item = await req.json();
    const phrases = fs.existsSync(PHRASE_PATH) ? JSON.parse(fs.readFileSync(PHRASE_PATH,'utf8')) : [];
    phrases.push({ id: phrases.length + 1, tsn: item.corrected || item.original, en: item.translation || '' });
    fs.writeFileSync(PHRASE_PATH, JSON.stringify(phrases, null, 2));
    const feedback = fs.existsSync(FEEDBACK_PATH) ? JSON.parse(fs.readFileSync(FEEDBACK_PATH,'utf8')) : [];
    const idx = feedback.findIndex((f:any) => f.ts === item.ts);
    if(idx>=0) feedback.splice(idx,1);
    fs.writeFileSync(FEEDBACK_PATH, JSON.stringify(feedback, null, 2));
    return NextResponse.json({ ok:true });
  } catch(e){
    console.error(e);
    return NextResponse.json({ error:'approve failed' }, { status:500 });
  }
}
