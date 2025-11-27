"use client";
import React, { useState } from "react";
import phrasebook from "../data/phrasebook.json";
import Header from "../components/Header";
export default function Phrasebook(){
  const [q,setQ]=useState('');
  const filtered = phrasebook.filter(p => p.tsn.toLowerCase().includes(q.toLowerCase()) || p.en.toLowerCase().includes(q.toLowerCase())).slice(0,500);
  return (
    <main>
      <Header />
      <div className="card">
        <h3>Phrasebook Explorer</h3>
        <input placeholder="Search Setswana or English" value={q} onChange={e=>setQ(e.target.value)} className="search" style={{marginTop:8}} />
        <div style={{marginTop:12,display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {filtered.map(p=>(
            <div key={p.id} className="p-3 border rounded">
              <div><strong>{p.tsn}</strong></div>
              <div className="small-muted">{p.en}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
