"use client";
import React, { useMemo } from "react";
import phrasebook from "../data/phrasebook.json";

type Phrase = { id:number; tsn:string; en:string; };

function levenshtein(a: string, b: string) {
  const A = String(a || "").toLowerCase().trim();
  const B = String(b || "").toLowerCase().trim();
  if (A === B) return 0;
  const m = A.length, n = B.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = A[i - 1] === B[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

export default function DidYouMean({ text, onSelect }: { text: string; onSelect: (s: string) => void; }) {
  const suggestions = useMemo(() => {
    if (!text || text.trim().length < 2) return [];
    const candidates = (phrasebook as Phrase[]).map(p => {
      // compare against both EN and TSN
      const dEn = levenshtein(text, p.en);
      const dTn = levenshtein(text, p.tsn);
      const score = Math.min(dEn, dTn);
      return { id: p.id, en: p.en, tsn: p.tsn, score };
    });
    candidates.sort((a, b) => a.score - b.score);
    // only return top 4 plausible suggestions (threshold relative to length)
    return candidates.slice(0, 4).filter(c => {
      const minLen = Math.min(String(text).length, Math.max(c.en.length, c.tsn.length));
      return c.score <= Math.max(1, Math.floor(minLen * 0.5)); // allow up to 50% edits
    });
  }, [text]);

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: "rgba(230,201,74,0.06)" }}>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>Did you mean?</div>
      <div style={{ display: "grid", gap: 8 }}>
        {suggestions.map(s => (
          <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{s.tsn}</div>
              <div className="small-muted">{s.en}</div>
            </div>
            <div>
              <button className="btn-ghost" onClick={() => onSelect(s.tsn)}>Use</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
