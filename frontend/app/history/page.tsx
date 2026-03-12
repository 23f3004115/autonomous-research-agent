"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useResearch } from "@/lib/ResearchContext";
import ActiveSessionsNav from "@/components/ui/ActiveSessionsNav";
import { IconFlask, IconRefresh, IconPlus, IconInbox, IconHistory, IconChevronDown, IconChevronRight } from "@/components/ui/Icons";

type Session = {
    id: string;
    goal: string;
    score: number;
    iterations: number;
    created_at: string;
    share_slug?: string;
};

type Filter = "all" | "good" | "retry";

export default function HistoryPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Filter>("all");
    const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
    const supabase = createClient();
    const { setActiveSessionId } = useResearch();

    const fetchSessions = useCallback(() => {
        setLoading(true);
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions`, { cache: "no-store" })
            .then(r => r.json())
            .then(data => { setSessions(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => { fetchSessions(); }, [fetchSessions]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    const filtered = sessions.filter(s => {
        if (filter === "good") return s.score >= 6;
        if (filter === "retry") return s.iterations > 1;
        return true;
    });

    const topics = useMemo(() => {
        const groups = new Map<string, Session[]>();
        for (const s of filtered) {
            const key = s.goal.toLowerCase().trim();
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(s);
        }
        
        return Array.from(groups.values()).map(groupSessions => {
            groupSessions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            return {
                id: groupSessions[0].goal.toLowerCase().trim(),
                goal: groupSessions[0].goal,
                sessions: groupSessions,
                latestDate: groupSessions[0].created_at,
                maxScore: Math.max(...groupSessions.map(s => s.score)),
            };
        }).sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime());
    }, [filtered]);

    const toggleTopic = (id: string) => {
        const next = new Set(expandedTopics);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedTopics(next);
    };

    // Stats
    const avgScore = sessions.length
        ? (sessions.reduce((a, s) => a + s.score, 0) / sessions.length).toFixed(1)
        : "—";
    const retryCount = sessions.filter(s => s.iterations > 1).length;
    const topicsCount = new Set(sessions.map(s => s.goal.toLowerCase().trim())).size;

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

            {/* Header */}
            <header className="no-print" style={{ padding: "0 1.5rem", height: 52, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "rgba(13, 17, 23, 0.8)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <IconFlask size={15} color="white" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Pulse</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Link href="/" onClick={() => setActiveSessionId(null)} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.75rem", borderRadius: 6, fontSize: "0.8rem", color: "white", textDecoration: "none", background: "var(--accent)" }}>
                        <IconPlus size={13} /> New Research
                    </Link>
                    
                    <div style={{ width: 1, height: 16, background: "var(--border)", margin: "0 0.5rem" }} />
                    <ActiveSessionsNav />
                    
                    <button onClick={handleLogout} style={{ padding: "0.3rem 0.75rem", borderRadius: 6, fontSize: "0.8rem", color: "var(--text-muted)", background: "transparent", border: "1px solid var(--border)", cursor: "pointer", marginLeft: "0.25rem" }}>
                        Sign out
                    </button>
                </div>
            </header>

            <main className="no-print" style={{ flex: 1, maxWidth: 760, width: "100%", margin: "0 auto", padding: "2rem 1rem" }}>

                {/* Page title + controls */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <IconHistory size={16} color="var(--accent)" />
                        <h1 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Research History</h1>
                    </div>
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

                {/* Stats bar */}
                {sessions.length > 0 && (
                    <div style={{ display: "flex", gap: "1.5rem", padding: "0.75rem 1rem", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, marginBottom: "1.25rem", fontSize: "0.8rem" }}>
                        <span style={{ color: "var(--text-muted)" }}><strong style={{ color: "var(--text)" }}>{sessions.length}</strong> sessions</span>
                        <span style={{ color: "var(--border)" }}>·</span>
                        <span style={{ color: "var(--text-muted)" }}><strong style={{ color: "var(--text)" }}>{topicsCount}</strong> topics tracking</span>
                        <span style={{ color: "var(--border)" }}>·</span>
                        <span style={{ color: "var(--text-muted)" }}>avg score <strong style={{ color: "var(--accent)" }}>{avgScore}/10</strong></span>
                    </div>
                )}

                {loading && <p style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "3rem" }}>Loading sessions...</p>}

                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {topics.map(topic => {
                        const isExpanded = expandedTopics.has(topic.id);
                        
                        return (
                            <div key={topic.id} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", transition: "border-color 0.2s" }}
                                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-light)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; }}>
                                
                                {/* Topic Group Header */}
                                <div onClick={() => toggleTopic(topic.id)} style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer" }}>
                                    <div style={{ color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
                                        {isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: "0.2rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--text)" }}>{topic.goal}</p>
                                        <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.73rem", color: "var(--text-muted)" }}>
                                            <span>Updated {new Date(topic.latestDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                            <span>·</span>
                                            <span style={{ color: "var(--accent)" }}>{topic.sessions.length} report{topic.sessions.length !== 1 ? "s" : ""}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                                        <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "0.1rem" }}>Best Score</p>
                                        <span style={{ fontSize: "1rem", fontWeight: 700, color: topic.maxScore >= 6 ? "var(--success)" : "var(--warning)" }}>
                                            {topic.maxScore}<span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>/10</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Expanded Sessions */}
                                {isExpanded && (
                                    <div style={{ background: "var(--bg-tertiary)", borderTop: "1px solid var(--border)", padding: "0.5rem 0" }}>
                                        {topic.sessions.map((s, idx) => (
                                            <Link key={s.id} href={`/history/${s.id}`} style={{ textDecoration: "none", display: "block" }}>
                                                <div style={{ padding: "0.75rem 1.25rem 0.75rem 3rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer", transition: "background 0.2s", background: "transparent" }}
                                                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                                                            {idx === 0 && <span style={{ fontSize: "0.6rem", padding: "0.1rem 0.4rem", background: "var(--accent-dim)", color: "var(--accent)", borderRadius: 10, fontWeight: 600 }}>LATEST</span>}
                                                            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                                                                {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" })}
                                                            </span>
                                                        </div>
                                                        <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                                            <span>{s.iterations} iteration{s.iterations !== 1 ? "s" : ""}</span>
                                                            {s.share_slug && <span style={{ color: "var(--accent)" }}>· shared</span>}
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: "right" }}>
                                                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: s.score >= 6 ? "var(--success)" : "var(--warning)" }}>
                                                            {s.score}/10
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}

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
