// src/app/lib/whisper.ts
// Dynamic browser loader for Xenova/transformers with clearer error semantics.

let asrPipeline: any = null;

export async function initWhisper(progressCb?: (p: number) => void) {
  if (asrPipeline) return asrPipeline;

  if (typeof window === "undefined") {
    throw new Error("initWhisper must be called in the browser (client-side).");
  }

  try {
    const transformers = await import("@xenova/transformers");

    // Try to set browser-only env preferences safely
    try {
      const e: any = transformers.env as any;
      e.allowLocalModels = false;
      e.useFSCache = true;
      e.backends = { webgpu: true, wasm: true, onnx: false };
    } catch (err) {
      // non-fatal - continue
      // console.warn("Could not set transformers env:", err);
    }

    const pipeline = transformers.pipeline;
    const modelId = "Xenova/whisper-tiny"; // tiny for demo; replace with base later if desired

    // create the pipeline
    asrPipeline = await pipeline("automatic-speech-recognition", modelId, {
      progress_callback: (p: number) => {
        if (progressCb) progressCb(p);
      },
    });

    return asrPipeline;
  } catch (err: any) {
    // Detect common "require is not defined" traces and throw a clear error so caller can fallback
    const message = err?.message || String(err);
    if (/require is not defined/i.test(message) || /Cannot find module|could not find module/i.test(message)) {
      const e = new Error("RequireInBrowserError: a Node-only dependency was requested in the browser. " + message);
      // preserve original error for logs
      (e as any).original = err;
      throw e;
    }
    // rethrow other errors
    throw err;
  }
}

export async function transcribeBlob(blob: Blob) {
  if (!asrPipeline) {
    throw new Error("Whisper pipeline not initialized. Call initWhisper() first.");
  }
  const url = URL.createObjectURL(blob);
  try {
    const out = await asrPipeline(url);
    if (!out) return "";
    if (typeof out === "string") return out;
    if (out?.text) return out.text;
    if (Array.isArray(out) && out[0]?.text) return out[0].text;
    return String(out);
  } finally {
    URL.revokeObjectURL(url);
  }
}
