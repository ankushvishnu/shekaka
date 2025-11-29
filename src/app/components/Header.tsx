"use client";
import Link from "next/link";
export default function Header(){ return (
  <header className="header">
    <div className="brand">
      <div className="logo">S</div>
      <div>
        <div style={{fontWeight:800}}>Shekaka</div>
        <div className="small-muted">Learn Setswana · Speak Confidently</div>
      </div>
    </div>
      <nav style={{display:'flex',gap:12,alignItems:'center'}}>
        <Link href="/landing" className="small-muted">Home</Link>
        <Link href="/learn" className="small-muted">Learn</Link>
        <Link href="/phrasebook" className="small-muted">Phrasebook</Link>
        <Link href="/teacher" className="small-muted">Teacher</Link>
      </nav>
  </header>
)}