"use client";
import React, { useRef, useState } from "react";
import { initWhisper, transcribeBlob } from "../lib/whisper";

export default function Recorder({ onTranscribed }: { onTranscribed: (t: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRef.current = recorder;
      chunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        setLoading(true);

        try {
          // Load model if not loaded already
          setModelLoading(true);
          await initWhisper();
          setModelLoading(false);

          const result = await transcribeBlob(blob);
          onTranscribed(result || "");
        } catch (err: any) {
          console.error("Whisper error:", err);
          alert("Transcription failed: " + err.message);
        } finally {
          setLoading(false);
        }
      };

      recorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Microphone access error:", error);
      alert("Please allow microphone access.");
    }
  };

  const stop = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button className="btn-ghost" onClick={() => (recording ? stop() : start())}>
        {recording ? "Stop" : "Record"}
      </button>

      {modelLoading && <div className="small-muted">Loading model…</div>}
      {loading && !modelLoading && <div className="small-muted">Transcribing…</div>}
    </div>
  );
}
