"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { IconRefresh, IconCopy, IconStar, IconDownload, IconPrinter } from "./Icons";

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

function extractSourceDomains(markdown: string): { domain: string; url: string }[] {
    const regex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
    const seen = new Set<string>();
    const sources: { domain: string; url: string }[] = [];
    let match;
    while ((match = regex.exec(markdown)) !== null) {
        try {
            const url = match[2];
            const domain = new URL(url).hostname.replace("www.", "");
            if (!seen.has(domain)) {
                seen.add(domain);
                sources.push({ domain, url });
            }
        } catch { /* invalid URL, skip */ }
    }
    return sources.slice(0, 12);
}

function downloadMarkdown(report: string, goal: string) {
    const filename = goal.slice(0, 40).replace(/[^a-z0-9]/gi, "-").toLowerCase() + ".md";
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

const BTN_BASE: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: "0.35rem",
    padding: "0.4rem 0.85rem", borderRadius: "8px",
    fontWeight: 600, fontSize: "0.78rem", cursor: "pointer",
    transition: "opacity 0.15s",
};

export default function ReportView({ report, score, subQuestions = [], goal = "" }: {
    report: string;
    score: number;
    subQuestions?: string[];
    goal?: string;
}) {
    if (!report) return null;
    const sources = extractSourceDomains(report);

    return (
        <div className="report-view-root" style={{ animation: "fadeUp 0.4s ease", display: "grid", gridTemplateColumns: "1fr 264px", gap: "1rem", alignItems: "start" }}>

            {/* ── Main report card ── */}
            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>

                {/* Toolbar */}
                <div style={{ display: "flex", gap: "0.5rem", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border)", background: "var(--bg-tertiary)" }}>
                    <button onClick={() => window.location.reload()} style={{ ...BTN_BASE, background: "var(--accent)", color: "white", border: "none" }}>
                        <IconRefresh size={13} color="white" /> Re-run
                    </button>
                    <button onClick={() => navigator.clipboard.writeText(report)} style={{ ...BTN_BASE, background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                        <IconCopy size={13} /> Copy
                    </button>
                    <button onClick={() => downloadMarkdown(report, goal)} style={{ ...BTN_BASE, background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                        <IconDownload size={13} /> Download .md
                    </button>
                    <button onClick={() => window.print()} style={{ ...BTN_BASE, background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                        <IconPrinter size={13} /> Print / PDF
                    </button>
                </div>

                {/* Report body */}
                <div className="report-content" style={{ padding: "1.75rem" }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
                </div>

                {/* Source chips */}
                {sources.length > 0 && (
                    <div style={{ padding: "0.85rem 1.25rem", borderTop: "1px solid var(--border)", background: "var(--bg-tertiary)" }}>
                        <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                            Sources used
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                            {sources.map(s => (
                                <a key={s.domain} href={s.url} target="_blank" rel="noopener noreferrer"
                                    style={{ fontSize: "0.7rem", padding: "0.2rem 0.55rem", borderRadius: 20, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)", textDecoration: "none", transition: "border-color 0.15s, color 0.15s" }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
                                >{s.domain}</a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Right panel ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", position: "sticky", top: "1rem" }}>

                {/* Quality score */}
                <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.25rem" }}>
                    <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Quality Score</p>
                    <div style={{ fontSize: "2.5rem", fontWeight: 800, color: score >= 7 ? "var(--success)" : "var(--warning)", lineHeight: 1 }}>
                        {score}<span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/10</span>
                    </div>
                    <div style={{ margin: "0.5rem 0" }}><StarRating score={score} /></div>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {score >= 8 ? "Analyst-grade quality" : score >= 6 ? "Approved by critic" : "Max iterations reached"}
                    </p>
                </div>

                {/* Sub-questions */}
                {subQuestions.length > 0 && (
                    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.25rem" }}>
                        <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>Research Questions</p>
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
