// src/app/lib/whisper.ts
import { pipeline, env } from "@xenova/transformers";

env.backends = {
  webgpu: true,   // try WebGPU first
  wasm: true,     // fallback to WASM
  onnx: false     // disable node backend
};

// Prefer WebGPU if available (Transformers.js will fallback to WASM automatically)
env.allowLocalModels = false;     // use CDN
env.useFSCache = true;            // cache model in browser
env.backends = { webgpu: true };  // try GPU first

let asrPipeline: any = null;

// Load tiny model
export async function initWhisper(progressCb?: (p: number) => void) {
  if (asrPipeline) return asrPipeline;

  // multilingual tiny model
  const modelId = "Xenova/whisper-tiny";

  asrPipeline = await pipeline(
    "automatic-speech-recognition",
    modelId,
    {
      progress_callback: (p) => {
        if (progressCb) progressCb(p);
        console.log("Whisper tiny load progress:", p);
      }
    }
  );

  console.log("Whisper tiny ready.");
  return asrPipeline;
}

export async function transcribeBlob(blob: Blob) {
  if (!asrPipeline) {
    throw new Error("Whisper pipeline not initialized.");
  }

  const url = URL.createObjectURL(blob);

  try {
    const output = await asrPipeline(url);

    if (output?.text) return output.text;
    if (typeof output === "string") return output;
    if (Array.isArray(output) && output[0]?.text) return output[0].text;

    return "";
  } finally {
    URL.revokeObjectURL(url);
  }
}
