"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { useResearch } from "@/lib/ResearchContext";
import { IconFlask, IconStar, IconHistory, IconShare, IconCopy, IconCheck, IconLoader, IconPlus } from "@/components/ui/Icons";

type Session = {
    id: string;
    goal: string;
    report: string;
    score: number;
    iterations: number;
    sub_questions: string[];
    created_at: string;
    share_slug?: string;
};

function StarRating({ score }: { score: number }) {
    const stars = Math.round((score / 10) * 5);
    return (
        <div style={{ display: "flex", gap: 3 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <IconStar key={i} size={13} color={i <= stars ? "#fbbf24" : "var(--border-light)"} filled={i <= stars} />
            ))}
        </div>
    );
}

export default function SessionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { setActiveSessionId } = useResearch();
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [sharing, setSharing] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${id}`)
            .then(r => r.json())
            .then(data => { setSession(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [id]);

    const handleShare = async () => {
        if (!session) return;
        setSharing(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${session.id}/share`, { method: "POST" });
            const { slug } = await res.json();
            const url = `${window.location.origin}/r/${slug}`;
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch { /* ignore */ }
        setSharing(false);
    };

    const handleCopyMarkdown = () => {
        if (session?.report) {
            navigator.clipboard.writeText(session.report);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", color: "var(--text-muted)" }}>
            <IconLoader size={18} color="var(--accent)" style={{ marginRight: "0.5rem" }} /> Loading...
        </div>
    );

    if (!session) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
            <p style={{ color: "var(--text-muted)" }}>Session not found.</p>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <header style={{ padding: "0 1.5rem", height: 52, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <IconFlask size={15} color="white" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Pulse</span>
                </div>
                <nav style={{ display: "flex", gap: "0.5rem" }}>
                    <Link href="/history" style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.75rem", borderRadius: 6, fontSize: "0.8rem", color: "var(--text-muted)", textDecoration: "none", border: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
                        <IconHistory size={13} /> History
                    </Link>
                    <Link href="/" onClick={() => setActiveSessionId(null)} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.75rem", borderRadius: 6, fontSize: "0.8rem", color: "white", textDecoration: "none", background: "var(--accent)" }}>
                        <IconPlus size={13} /> New Research
                    </Link>
                </nav>
            </header>

            <main style={{ flex: 1, maxWidth: 900, width: "100%", margin: "0 auto", padding: "2rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 240px", gap: "1.5rem", alignItems: "start" }}>
                {/* Report */}
                <div>
                    <div style={{ marginBottom: "1.25rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                        <h1 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-muted)", lineHeight: 1.5 }}>
                            <span style={{ color: "var(--text)", fontSize: "1.1rem" }}>{session.goal}</span>
                            <div style={{ fontSize: "0.72rem", marginTop: "0.25rem", color: "var(--text-muted)" }}>
                                {new Date(session.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {session.iterations} iteration{session.iterations !== 1 ? "s" : ""}
                            </div>
                        </h1>
                        <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                            <button onClick={handleCopyMarkdown}
                                style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.85rem", background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 8, fontWeight: 600, fontSize: "0.78rem", cursor: "pointer" }}>
                                {copied ? <IconCheck size={13} color="var(--success)" /> : <IconCopy size={13} />}
                                {copied ? "Copied!" : "Copy"}
                            </button>
                            <button onClick={handleShare} disabled={sharing}
                                style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.85rem", background: "var(--accent)", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: "0.78rem", cursor: "pointer" }}>
                                {sharing ? <IconLoader size={13} color="white" /> : <IconShare size={13} color="white" />}
                                Share
                            </button>
                        </div>
                    </div>

                    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.75rem" }}>
                        <div className="report-content">
                            <ReactMarkdown>{session.report}</ReactMarkdown>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", position: "sticky", top: "1.5rem" }}>
                    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem" }}>
                        <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Quality Score</p>
                        <div style={{ fontSize: "2.5rem", fontWeight: 800, color: session.score >= 7 ? "var(--success)" : "var(--warning)", lineHeight: 1 }}>
                            {session.score}<span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/10</span>
                        </div>
                        <div style={{ margin: "0.5rem 0" }}><StarRating score={session.score} /></div>
                    </div>

                    {session.sub_questions?.length > 0 && (
                        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem" }}>
                            <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>Sub-Questions</p>
                            {session.sub_questions.map((q, i) => (
                                <div key={i} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.5rem", alignItems: "flex-start" }}>
                                    <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--accent)", minWidth: 16, marginTop: 1 }}>{i + 1}.</span>
                                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>{q}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
