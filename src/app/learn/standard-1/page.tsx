"use client";

import Header from "../../components/Header";
import syllabus from "../../data/syllabus/standard1.json";
import { useState } from "react";

function Bilingual({ en, tn }: { en: string; tn: string }) {
  const [showTn, setShowTn] = useState(true);
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div className="small-muted" style={{ fontWeight: 700 }}>EN</div>
        <div style={{ flex: 1 }}>{en}</div>
        <button className="btn-ghost" onClick={() => setShowTn(!showTn)}>{showTn ? "Hide TN" : "Show TN"}</button>
      </div>
      {showTn && (
        <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: "rgba(230,201,74,0.06)" }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Setswana</div>
          <div style={{ marginTop: 6 }}>{tn}</div>
        </div>
      )}
    </div>
  );
}

export default function Standard1() {
  const data = syllabus;
  return (
    <main>
      <Header />
      <div style={{ marginTop: 18 }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>{data.title}</div>
              <div className="small-muted" style={{ marginTop: 6 }}>Overview and learnable lessons (English + Setswana)</div>
            </div>
            <div>
              <button className="btn-primary" onClick={() => alert("Start lesson (future)")} >Start sample lesson</button>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <Bilingual en={data.overview.en} tn={data.overview.tn} />
          </div>

          <div style={{ marginTop: 16 }}>
            {data.modules.map((m: any) => (
              <section key={m.moduleId} style={{ marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{m.title.en}</div>
                    <div className="small-muted" style={{ marginTop: 4 }}>{m.title.tn}</div>
                  </div>
                </div>

                <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                  {m.units.map((u: any) => (
                    <div key={u.unitId} className="card">
                      <div style={{ fontWeight: 800 }}>{u.title.en}</div>
                      <div className="small-muted" style={{ marginTop: 6 }}>{u.title.tn}</div>

                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontWeight: 700 }}>General objective</div>
                        <Bilingual en={u.objectives.general.en} tn={u.objectives.general.tn} />

                        <div style={{ marginTop: 10, fontWeight: 700 }}>Specific lessons</div>
                        <ul style={{ marginTop: 8 }}>
                          {u.objectives.specific.map((s: any, idx: number) => (
                            <li key={idx} style={{ marginTop: 6 }}>
                              <Bilingual en={s.en} tn={s.tn} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
