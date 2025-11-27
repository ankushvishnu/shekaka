"use client";
import React, { useState, useRef } from "react";
export default function Recorder({ onTranscribed }: { onTranscribed: (t: string) => void }) {
  const [rec, setRec] = useState(false);
  const ref = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const start = async () => {
    const s = await navigator.mediaDevices.getUserMedia({ audio: true });
    const r = new MediaRecorder(s);
    r.ondataavailable = (e) => chunks.current.push(e.data);
    r.onstop = async () => {
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      chunks.current = [];
      const fd = new FormData();
      fd.append("audio", blob, "rec.webm");
      try {
        const res = await fetch("/api/asr", { method: "POST", body: fd });
        const d = await res.json();
        if (d.text) onTranscribed(d.text);
      } catch (e) { console.error(e); alert("ASR failed"); }
    };
    r.start(); ref.current = r; setRec(true);
  };
  const stop = () => { ref.current?.stop(); setRec(false); };
  return <button onClick={rec ? stop : start} className="btn-ghost">{rec? 'Stop':'Record'}</button>;
}