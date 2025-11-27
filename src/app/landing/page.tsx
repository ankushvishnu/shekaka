"use client";
import React from "react";
import Link from "next/link";
export default function Landing(){ return (
  <main>
    <div style={{marginBottom:16}}><Link href="/" className="small-muted">← Back to app</Link></div>
    <div className="card" style={{display:'flex',gap:20,alignItems:'center'}}>
      <div style={{flex:1}}>
        <h1 style={{fontSize:28,margin:0,fontWeight:900}}>Shekaka — Learn Setswana with Confidence</h1>
        <p className="small-muted" style={{marginTop:8}}>Offline-first ASR, teacher-verified phrasebook, and adaptive lessons.</p>
        <div style={{marginTop:16,display:'flex',gap:12}}>
          <Link href="/" className="btn-primary">Open App</Link>
          <a className="btn-ghost" href="#samples">Hear Samples</a>
        </div>
      </div>
      <div style={{width:360}}>
        <div className="card">
          <strong>Audio Samples</strong>
          <div style={{marginTop:8}}>
            <audio controls style={{width:'100%'}}><source src="/audio/common_voice_tn_40809726.mp3" type="audio/mpeg" /></audio>
            <audio controls style={{width:'100%',marginTop:8}}><source src="/audio/common_voice_tn_40809727.mp3" type="audio/mpeg" /></audio>
          </div>
        </div>
      </div>
    </div>
  </main>
)}