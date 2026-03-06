"use client";
import { useEffect, useState, useCallback } from "react";
import { IconFlask, IconRefresh, IconPlus, IconInbox } from "@/components/ui/Icons";

type Session = {
    id: string;
    goal: string;
    score: number;
    iterations: number;
    created_at: string;
};

type Filter = "all" | "good" | "retry";

export default function HistoryPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Filter>("all");

    // cache: "no-store" prevents Next.js from returning a stale cached response
    const fetchSessions = useCallback(() => {
        setLoading(true);
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions`, { cache: "no-store" })
            .then(r => r.json())
            .then(data => { setSessions(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => { fetchSessions(); }, [fetchSessions]);

    const filtered = sessions.filter(s => {
        if (filter === "good") return s.score >= 6;
        if (filter === "retry") return s.score < 6;
        return true;
    });

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

            {/* Header */}
            <header style={{ padding: "0 1.5rem", height: 52, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <IconFlask size={15} color="white" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>ResearchAgent</span>
                </div>
                <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.75rem", borderRadius: 6, fontSize: "0.8rem", color: "var(--text-muted)", textDecoration: "none", border: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
                    <IconPlus size={13} /> New Research
                </a>
            </header>

            <main style={{ flex: 1, maxWidth: 760, width: "100%", margin: "0 auto", padding: "2rem 1rem" }}>

                {/* Page title + controls */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <h1 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Research Session History</h1>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <button onClick={fetchSessions} style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.3rem 0.6rem", borderRadius: 6, fontSize: "0.75rem", color: "var(--text-muted)", background: "transparent", border: "1px solid var(--border)", cursor: "pointer" }}>
                            <IconRefresh size={12} /> Refresh
                        </button>
                        <div style={{ display: "flex", gap: "0.25rem", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.25rem" }}>
                            {(["all", "good", "retry"] as Filter[]).map(f => (
                                <button key={f} onClick={() => setFilter(f)} style={{ padding: "0.25rem 0.65rem", borderRadius: 6, fontSize: "0.75rem", fontWeight: 500, border: "none", cursor: "pointer", background: filter === f ? "var(--accent)" : "transparent", color: filter === f ? "white" : "var(--text-muted)", transition: "all 0.2s" }}>
                                    {f === "all" ? "All" : f === "good" ? "Score ≥6" : "Retried"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading && (
                    <p style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "3rem" }}>Loading sessions...</p>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {filtered.map(s => (
                        <div key={s.id} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.score >= 6 ? "var(--success)" : "var(--warning)", flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: "0.2rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.goal}</p>
                                <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.73rem", color: "var(--text-muted)" }}>
                                    <span>{new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                                    <span>·</span>
                                    <span>{s.iterations} iteration{s.iterations !== 1 ? "s" : ""}</span>
                                </div>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                                <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "0.1rem" }}>Critic Score</p>
                                <span style={{ fontSize: "1rem", fontWeight: 700, color: s.score >= 6 ? "var(--success)" : "var(--warning)" }}>
                                    {s.score}<span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>/10</span>
                                </span>
                            </div>
                        </div>
                    ))}

                    {!loading && filtered.length === 0 && (
                        <div style={{ textAlign: "center", marginTop: "4rem", color: "var(--text-muted)" }}>
                            <IconInbox size={32} color="var(--border-light)" style={{ margin: "0 auto 0.5rem" }} />
                            <p style={{ fontSize: "0.88rem" }}>{filter === "all" ? "No sessions yet. Run your first research!" : "No sessions match this filter."}</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
