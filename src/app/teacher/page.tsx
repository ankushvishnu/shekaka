"use client";
import React,{useEffect,useState} from "react";
import Header from "../components/Header";
export default function Teacher(){
  const [data,setData]=useState<any[]>([]);
  useEffect(()=>{ fetch('/api/feedback').then(r=>r.json()).then(d=>setData(d||[])); },[]);
  const approve = async (item:any) => { await fetch('/api/feedback/approve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(item)}); setData(prev=>prev.filter(p=>p.ts!==item.ts)); };
  return (
    <main>
      <Header />
      <div className="card">
        <h3>Teacher Dashboard</h3>
        <table style={{width:'100%',borderCollapse:'collapse',marginTop:8}}>
          <thead><tr><th>Original</th><th>Translation</th><th>Correction</th><th>Action</th></tr></thead>
          <tbody>
            {data.map((row,idx)=>(<tr key={idx} style={{borderTop:'1px solid #eee'}}><td style={{padding:8}}>{row.original}</td><td style={{padding:8}}>{row.translation}</td><td style={{padding:8}}>{row.corrected}</td><td style={{padding:8}}><button className="btn-primary" onClick={()=>approve(row)}>Approve</button></td></tr>))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
