import { NextResponse } from 'next/server';
import fs from 'fs';
const PATH = './feedback.json';
export async function GET(){ try{ if(!fs.existsSync(PATH)) return NextResponse.json([]); const raw = fs.readFileSync(PATH,'utf8'); return NextResponse.json(JSON.parse(raw||'[]')); } catch(e){ console.error(e); return NextResponse.json([], { status:500 }); } }
export async function POST(req: Request){ try{ const body = await req.json(); const arr = fs.existsSync(PATH) ? JSON.parse(fs.readFileSync(PATH,'utf8')) : []; arr.push({ ...body, ts: new Date().toISOString() }); fs.writeFileSync(PATH, JSON.stringify(arr, null, 2)); return NextResponse.json({ ok:true }); } catch(e){ console.error(e); return NextResponse.json({ error:'write failed' }, { status:500 }); } }
