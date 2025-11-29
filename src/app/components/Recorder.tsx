"use client";
import React, { useRef, useState } from "react";
import { initWhisper, transcribeBlob } from "../lib/whisper";

/**
 * Recorder tries:
 * 1) client Whisper (Xenova) transcription
 * 2) server ASR (/api/asr) upload
 * 3) Web Speech API (live recognition) as final fallback
 *
 * It always returns a safe JSON/string result or a demo phrase.
 */

export default function Recorder({ onTranscribed }: { onTranscribed: (t: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [modelLoading, setModelLoading] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const serverAsr = async (blob: Blob) => {
    setStatus("Uploading to server ASR...");
    const fd = new FormData();
    fd.append("audio", blob, "rec.webm");
    try {
      const res = await fetch("/api/asr", { method: "POST", body: fd });
      const ct = res.headers.get("content-type") || "";
      if (!res.ok) {
        const bodyText = ct.includes("application/json") ? JSON.stringify(await res.json()) : await res.text();
        throw new Error(`Server ASR error: HTTP ${res.status} — ${bodyText}`);
      }
      if (ct.includes("application/json")) {
        const j = await res.json();
        return j?.text || "";
      }
      return await res.text();
    } catch (e) {
      console.error("serverAsr failed:", e);
      throw e;
    }
  };

  const tryWebSpeech = (resolve: (s: string) => void, reject: (e: any) => void) => {
    // final fallback: use Web Speech API if available
    const win: any = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      reject(new Error("Web Speech API not supported"));
      return;
    }
    const r = new SpeechRecognition();
    r.lang = "en-US"; // user can switch later; we use English fallback
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (ev: any) => {
      const text = ev.results?.[0]?.[0]?.transcript ?? "";
      resolve(text);
    };
    r.onerror = (err: any) => reject(err);
    r.onend = () => {
      // if no result, reject
      reject(new Error("No result from WebSpeech"));
    };
    try {
      r.start();
      setStatus("Listening via browser speech service (Web Speech API) — speak now...");
    } catch (e) {
      reject(e);
    }
  };

  const start = async () => {
    setStatus(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(s);
      mediaRef.current = r;
      chunks.current = [];

      r.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.current.push(e.data);
      };

      r.onstop = async () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });

        // 1) Try client whisper
        setStatus("Trying client Whisper...");
        try {
          setModelLoading(true);
          await initWhisper((p) => setStatus(`Model loading: ${Math.round(p)}%`));
          setModelLoading(false);
          setStatus("Transcribing locally (Whisper)...");
          const txt = await transcribeBlob(blob);
          if (txt && txt.trim().length > 0) {
            setStatus("Transcription (Whisper) succeeded");
            onTranscribed(txt);
            return;
          } else {
            setStatus("Whisper returned empty text — falling back");
            console.warn("Whisper returned empty string");
          }
        } catch (err: any) {
          setModelLoading(false);
          console.warn("Whisper failed:", err);
          // If error looks like Node-in-browser require, log and fallthrough to server
          setStatus("Whisper failed, falling back to server ASR...");
        }

        // 2) Try server ASR
        try {
          const serverText = await serverAsr(blob);
          if (serverText && serverText.trim().length > 0) {
            setStatus("Server ASR succeeded");
            onTranscribed(serverText);
            return;
          } else {
            setStatus("Server ASR returned empty text — falling back");
            console.warn("Server ASR returned empty");
          }
        } catch (serverErr) {
          console.error("Server ASR error:", serverErr);
          setStatus("Server ASR failed — attempting browser speech recognition fallback");
        }

        // 3) Final fallback: Web Speech API (live)
        try {
          const textFromWebSpeech = await new Promise<string>((resolve, reject) => {
            tryWebSpeech(resolve, reject);
          });
          setStatus("Transcription via Web Speech API succeeded");
          onTranscribed(textFromWebSpeech);
          return;
        } catch (wsErr) {
          console.error("WebSpeech fallback failed:", wsErr);
          setStatus("All transcription methods failed");
          // final fallback: demo phrase so UI continues
          onTranscribed("Dumela"); // safe demo phrase
          return;
        }
      };

      r.start();
      setRecording(true);
      setStatus("Recording...");
    } catch (e) {
      console.error("Microphone start error:", e);
      setStatus("Microphone access error");
      alert("Could not access microphone. Check permissions.");
    }
  };

  const stop = () => {
    try {
      mediaRef.current?.stop();
    } catch (e) {
      console.warn("stop error", e);
    } finally {
      setRecording(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button className="btn-ghost" onClick={() => (recording ? stop() : start())}>
        {recording ? "Stop" : "Record"}
      </button>
      <button
        className="btn-ghost"
        onClick={() => {
          setStatus("Demo phrase inserted");
          onTranscribed("Dumela");
        }}
      >
        Demo phrase
      </button>

      <div style={{ minWidth: 220 }}>
        {modelLoading && <div className="small-muted">Model loading...</div>}
        {status && <div className="small-muted">{status}</div>}
      </div>
    </div>
  );
}
