"use client";
import ReactMarkdown from "react-markdown";
import { IconRefresh, IconCopy, IconStar } from "./Icons";

function StarRating({ score }: { score: number }) {
    const stars = Math.round((score / 10) * 5);
    return (
        <div style={{ display: "flex", gap: "3px" }}>
            {[1, 2, 3, 4, 5].map(i => (
                <IconStar key={i} size={14} color={i <= stars ? "#fbbf24" : "var(--border-light)"} filled={i <= stars} />
            ))}
        </div>
    );
}

export default function ReportView({ report, score, subQuestions = [] }: {
    report: string;
    score: number;
    subQuestions?: string[];
}) {
    if (!report) return null;

    return (
        <div style={{ animation: "fadeUp 0.4s ease", display: "grid", gridTemplateColumns: "1fr 260px", gap: "1rem", alignItems: "start" }}>

            {/* Main report card */}
            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.75rem" }}>
                <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem" }}>
                    <button onClick={() => window.location.reload()} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.9rem", background: "var(--accent)", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer" }}>
                        <IconRefresh size={13} color="white" /> Re-run
                    </button>
                    <button onClick={() => navigator.clipboard.writeText(report)} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.9rem", background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: "8px", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer" }}>
                        <IconCopy size={13} /> Copy
                    </button>
                </div>
                <div className="report-content">
                    <ReactMarkdown>{report}</ReactMarkdown>
                </div>
            </div>

            {/* Right panel: score + research path */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", position: "sticky", top: "1rem" }}>

                {/* Quality score card */}
                <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.25rem" }}>
                    <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Quality Score</p>
                    <div style={{ fontSize: "2.5rem", fontWeight: 800, color: score >= 7 ? "var(--success)" : "var(--warning)", lineHeight: 1 }}>
                        {score}<span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/10</span>
                    </div>
                    <div style={{ margin: "0.5rem 0" }}>
                        <StarRating score={score} />
                    </div>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {score >= 7 ? "Critic approved on first review" : `Finalized after 3 iterations`}
                    </p>
                </div>

                {/* Research path */}
                {subQuestions.length > 0 && (
                    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.25rem" }}>
                        <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>Original Sub-Questions</p>
                        {subQuestions.map((q, i) => (
                            <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem", alignItems: "flex-start" }}>
                                <span style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--accent-dim)", border: "1px solid var(--accent-border)", fontSize: "0.6rem", fontWeight: 700, color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                                    {i + 1}
                                </span>
                                <p style={{ fontSize: "0.73rem", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>{q}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
