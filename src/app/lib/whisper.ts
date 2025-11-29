// src/app/lib/whisper.ts
// Xenova / transformers.js wrapper for browser ASR (whisper-tiny)
//
// NOTE: we cast `env` to `any` when mutating runtime options to avoid TypeScript errors
// which happen when assigning shapes that differ from the library's declared types.

import { pipeline, env } from "@xenova/transformers";

// Apply runtime preferences safely (avoid TypeScript 'type' errors)
try {
  const _env: any = env as any;
  // prefer webgpu if available, fallback to wasm automatically
  _env.backends = { webgpu: true, wasm: true, onnx: false };
  _env.allowLocalModels = false;
  _env.useFSCache = true;
} catch (e) {
  // Non-fatal: if setting env fails, transformers.js will choose defaults
  // Log for debugging in Render logs
  // eslint-disable-next-line no-console
  console.warn("Could not set transformers env preferences:", e);
}

let asrPipeline: any = null;

// Load tiny (multilingual) model for fast demo behaviour
export async function initWhisper(progressCb?: (p: number) => void) {
  if (asrPipeline) return asrPipeline;

  const modelId = "Xenova/whisper-tiny";

  // create the pipeline for ASR
  asrPipeline = await pipeline("automatic-speech-recognition", modelId, {
    progress_callback: (p: number) => {
      if (progressCb) progressCb(p);
      // eslint-disable-next-line no-console
      console.log("whisper tiny load progress:", p);
    },
  });

  // eslint-disable-next-line no-console
  console.log("Whisper tiny ready.");
  return asrPipeline;
}

export async function transcribeBlob(blob: Blob) {
  if (!asrPipeline) {
    throw new Error("Whisper pipeline not initialized. Call initWhisper() first.");
  }

  const url = URL.createObjectURL(blob);
  try {
    const output = await asrPipeline(url);
    if (!output) return "";
    if (typeof output === "string") return output;
    if (output?.text) return output.text;
    if (Array.isArray(output) && output[0]?.text) return output[0].text;
    return String(output);
  } finally {
    URL.revokeObjectURL(url);
  }
}
