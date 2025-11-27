"use client";
import React, { useState } from "react";
export default function TranslationCard({ original, translated, lang }: { original: string; translated: string; lang: string; }) {
  const [corr, setCorr] = useState("");
  const submit = async () => {
    await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ original, translation: translated, corrected: corr, lang }) });
    alert("Thanks — correction saved.");
    setCorr("");
  };
  return (
    <div style={{marginTop:14}}>
      <div style={{display:'flex',justifyContent:'space-between'}}><div style={{fontWeight:700}}>Result</div><div className="small-muted">{lang}</div></div>
      <div className="output"><div style={{fontSize:15}}>{translated}</div></div>
      <div style={{marginTop:10,display:'flex',gap:8}}>
        <input value={corr} onChange={e=>setCorr(e.target.value)} placeholder="Suggest a correction (optional)" className="search" />
        <button className="btn-primary" onClick={submit}>Submit</button>
      </div>
    </div>
  );
}