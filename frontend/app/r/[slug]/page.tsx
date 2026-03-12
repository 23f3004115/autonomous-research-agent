"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { IconFlask, IconStar } from "@/components/ui/Icons";

type Session = {
    goal: string;
    report: string;
    score: number;
    iterations: number;
    sub_questions: string[];
    created_at: string;
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

export default function SharedReportPage() {
    const { slug } = useParams<{ slug: string }>();
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/r/${slug}`)
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => { setSession(data); setLoading(false); })
            .catch(() => { setNotFound(true); setLoading(false); });
    }, [slug]);

    if (loading) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Loading report...
        </div>
    );

    if (notFound || !session) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔍</div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.4rem" }}>Report not found</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>This link may have expired or the report is private.</p>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
            {/* Header */}
            <header style={{ padding: "0 1.5rem", height: 52, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <IconFlask size={15} color="white" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Pulse</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", padding: "0.15rem 0.5rem", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 20 }}>Shared Report</span>
                </div>
                <Link href="/login" style={{ fontSize: "0.8rem", color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
                    Try Pulse →
                </Link>
            </header>

            <main style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 240px", gap: "1.5rem", alignItems: "start" }}>
                {/* Report */}
                <div>
                    <h1 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "1.5rem", lineHeight: 1.5, borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                        Research: <span style={{ color: "var(--text)" }}>{session.goal}</span>
                    </h1>
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
                        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{session.iterations} iteration{session.iterations !== 1 ? "s" : ""}</p>
                    </div>

                    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem" }}>
                        <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Generated</p>
                        <p style={{ fontSize: "0.82rem", color: "var(--text)" }}>{new Date(session.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    </div>

                    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem" }}>
                        <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>Sub-Questions</p>
                        {session.sub_questions?.map((q, i) => (
                            <div key={i} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.5rem", alignItems: "flex-start" }}>
                                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--accent)", minWidth: 16, marginTop: 1 }}>{i + 1}.</span>
                                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>{q}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
