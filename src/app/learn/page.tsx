"use client";
import Link from "next/link";
import Header from "../components/Header";
import syllabus from "../data/syllabus/standard1.json";

export default function LearnIndex() {
  return (
    <main style={{ paddingBottom: 40 }}>
      <Header />
      <div style={{ marginTop: 18 }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Learn — Syllabus</h2>
              <div className="small-muted" style={{ marginTop: 6 }}>
                Quick access to syllabus pages and learner materials (English + Setswana)
              </div>
            </div>
            <div>
              <Link href="/learn/standard-1" className="btn-primary">Open Standard 1</Link>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <p style={{ margin: 0 }}>
              The syllabus index shows all standards. We're starting with <strong>Standard 1</strong>.
            </p>

            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
              {[1,2,3,4,5,6,7].map(n => (
                <div key={n} className="card" style={{ padding: 12 }}>
                  <div style={{ fontWeight: 800 }}>Standard {n}</div>
                  <div className="small-muted" style={{ marginTop: 6 }}>
                    {n === 1 ? "Start here — Overview & lessons" : "Coming soon"}
                  </div>
                  {n === 1 && <div style={{ marginTop: 10 }}><Link href="/learn/standard-1" className="btn-ghost">Open</Link></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
