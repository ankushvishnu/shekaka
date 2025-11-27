"use client";
import React, { useState } from "react";
import Header from "./components/Header";
import Recorder from "./components/Recorder";
import TranslationCard from "./components/TranslationCard";

export default function AppPage() {
  const [text,setText]=useState("");
  const [out,setOut]=useState("");
  const [lang,setLang]=useState("Setswana → English");
  const [loading,setLoading]=useState(false);
  const [message,setMessage]=useState("");
  const translate = async () => {
    setLoading(true); setMessage(""); setOut("");
    try{
      const res = await fetch('/api/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,from:lang.split(' → ')[0],to:lang.split(' → ')[1]})});
      const d = await res.json();
      if(d.translation) setOut(d.translation); else if(d.error) setMessage(d.error); else setMessage('No translation returned.');
    }catch(e){ setMessage('Translation failed. See console.'); console.error(e); }
    setLoading(false);
  };
  const speak=(t:string)=>{ if(!t) return; const u=new SpeechSynthesisUtterance(t); u.lang = lang.includes('Setswana') ? 'tn' : 'en-US'; speechSynthesis.speak(u); }
  return (
    <main>
      <Header />
      <div className="grid-2">
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontWeight:800,fontSize:18}}>Live Practice</div>
              <div className="small-muted">Short speaking & translation exercises</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <div style={{textAlign:'right'}}>
                <div style={{fontWeight:700}}>Level</div><div className="small-muted">Beginner</div>
              </div>
            </div>
          </div>
          <div style={{marginTop:12}}>
            <textarea className="input" placeholder="Type or press record to speak..." value={text} onChange={e=>setText(e.target.value)} />
            <div className="controls">
              <button className="btn-primary" onClick={translate}>{loading? 'Working...':'Translate'}</button>
              <Recorder onTranscribed={(t)=>setText(t)} />
              <button className="btn-ghost" onClick={()=>speak(out)}>🔊 Speak</button>
              <div style={{marginLeft:'auto'}}><select value={lang} onChange={e=>setLang(e.target.value)} className="search"><option>Setswana → English</option><option>English → Setswana</option></select></div>
            </div>
            {message && <div className="small-muted" style={{color:'#b34700',marginTop:10}}>{message}</div>}
            {out && <TranslationCard original={text} translated={out} lang={lang} />}
          </div>
        </div>

        <aside>
          <div className="card" style={{marginBottom:12}}>
            <div style={{fontWeight:700}}>Lesson Snapshot</div>
            <div className="small-muted" style={{marginTop:8}}>Progress & accuracy at a glance</div>
          </div>

          <div className="card">
            <div style={{fontWeight:700}}>Samples</div>
            <div style={{marginTop:8}}>
              <audio controls style={{width:'100%'}}><source src="/audio/common_voice_tn_40809726.mp3" type="audio/mpeg" /></audio>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
