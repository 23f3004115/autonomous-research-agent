"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import ActiveSessionsNav from "@/components/ui/ActiveSessionsNav";
import {
    IconFlask, IconBell, IconPlus, IconHistory, IconCalendar,
    IconTrash, IconPause, IconPlay, IconLoader, IconCheck
} from "@/components/ui/Icons";

type Monitor = {
    id: string;
    topic: string;
    schedule: "daily" | "weekly" | "monthly";
    active: boolean;
    last_score?: number;
    last_run?: string;
    next_run: string;
    email: string;
};

const SCHEDULE_LABELS = { daily: "Daily", weekly: "Weekly", monthly: "Monthly" };
const SCHEDULE_COLORS = { daily: "var(--searcher)", weekly: "var(--accent)", monthly: "var(--writer)" };

export default function MonitorsPage() {
    const [monitors, setMonitors] = useState<Monitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [userId, setUserId] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const supabase = createClient();

    // Form state
    const [topic, setTopic] = useState("");
    const [schedule, setSchedule] = useState<"daily" | "weekly" | "monthly">("weekly");
    const [notifyEmail, setNotifyEmail] = useState("");
    const [creating, setCreating] = useState(false);
    const [created, setCreated] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                setUserId(data.user.id);
                setUserEmail(data.user.email ?? "");
                setNotifyEmail(data.user.email ?? "");
                fetchMonitors(data.user.id);
            }
        });
    }, []);

    const fetchMonitors = (uid: string) => {
        setLoading(true);
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/monitors/${uid}`)
            .then(r => r.json())
            .then(data => { setMonitors(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;
        setCreating(true);
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/monitors`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic, schedule, email: notifyEmail, user_id: userId }),
        });
        setCreating(false);
        setCreated(true);
        setTopic("");
        setShowForm(false);
        setTimeout(() => setCreated(false), 3000);
        fetchMonitors(userId);
    };

    const handleToggle = async (monitor: Monitor) => {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/monitors/${monitor.id}/toggle`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ active: !monitor.active }),
        });
        fetchMonitors(userId);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this monitor? This cannot be undone.")) return;
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/monitors/${id}`, { method: "DELETE" });
        fetchMonitors(userId);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    const formatNextRun = (iso: string) => {
        const d = new Date(iso);
        const now = new Date();
        const diff = d.getTime() - now.getTime();
        const hours = Math.round(diff / (1000 * 60 * 60));
        if (hours < 24) return `in ~${hours}h`;
        const days = Math.round(hours / 24);
        return `in ~${days}d`;
    };

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
                <nav style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.75rem", borderRadius: 6, fontSize: "0.8rem", color: "var(--text-muted)", textDecoration: "none" }}>Research</a>
                    <a href="/history" style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.75rem", borderRadius: 6, fontSize: "0.8rem", color: "var(--text-muted)", textDecoration: "none" }}>
                        <IconHistory size={13} />History
                    </a>
                    <a href="/monitors" style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.75rem", borderRadius: 6, fontSize: "0.8rem", color: "white", textDecoration: "none", background: "var(--accent)" }}>
                        <IconBell size={13} />Monitors
                    </a>

                    <div style={{ width: 1, height: 16, background: "var(--border)", margin: "0 0.5rem" }} />
                    <ActiveSessionsNav />

                    <button onClick={handleLogout} style={{ padding: "0.3rem 0.75rem", borderRadius: 6, fontSize: "0.8rem", color: "var(--text-muted)", background: "transparent", border: "1px solid var(--border)", cursor: "pointer", marginLeft: "0.25rem" }}>
                        Sign out
                    </button>
                </nav>
            </header>

            <main style={{ flex: 1, maxWidth: 760, width: "100%", margin: "0 auto", padding: "2rem 1rem" }}>

                {/* Title + New button */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                            <IconBell size={16} color="var(--accent)" />
                            <h1 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Research Monitors</h1>
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Set up topics to research automatically on a schedule. Get results in your inbox.</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)}
                        style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", background: "var(--accent)", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}>
                        <IconPlus size={14} color="white" /> New Monitor
                    </button>
                </div>

                {/* Success banner */}
                {created && (
                    <div style={{ background: "var(--success-dim)", border: "1px solid rgba(63,185,80,0.3)", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--success)" }}>
                        <IconCheck size={15} color="var(--success)" /> Monitor created! First research will run on schedule.
                    </div>
                )}

                {/* Create form */}
                {showForm && (
                    <form onSubmit={handleCreate} style={{ background: "var(--bg-secondary)", border: "1px solid var(--accent-border)", borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.9rem", animation: "fadeUp 0.25s ease" }}>
                        <h3 style={{ fontSize: "0.88rem", fontWeight: 700, margin: 0 }}>New Monitor</h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                            <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>Research Topic</label>
                            <input value={topic} onChange={e => setTopic(e.target.value)} required
                                placeholder="e.g. AI regulation in the EU, OpenAI competitor landscape..."
                                style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.6rem 0.85rem", color: "var(--text)", fontSize: "0.88rem", outline: "none", fontFamily: "inherit" }}
                                onFocus={e => e.target.style.borderColor = "var(--accent)"}
                                onBlur={e => e.target.style.borderColor = "var(--border)"}
                            />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>Schedule</label>
                                <select value={schedule} onChange={e => setSchedule(e.target.value as typeof schedule)}
                                    style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.6rem 0.85rem", color: "var(--text)", fontSize: "0.88rem", outline: "none", fontFamily: "inherit", cursor: "pointer" }}>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>Email notifications</label>
                                <input type="email" value={notifyEmail} onChange={e => setNotifyEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.6rem 0.85rem", color: "var(--text)", fontSize: "0.88rem", outline: "none", fontFamily: "inherit" }}
                                    onFocus={e => e.target.style.borderColor = "var(--accent)"}
                                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                                />
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                            <button type="button" onClick={() => setShowForm(false)}
                                style={{ padding: "0.5rem 1rem", background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.82rem", cursor: "pointer" }}>
                                Cancel
                            </button>
                            <button type="submit" disabled={creating || !topic.trim()}
                                style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1.1rem", background: topic.trim() ? "var(--accent)" : "var(--border)", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: "0.82rem", cursor: topic.trim() ? "pointer" : "not-allowed" }}>
                                {creating ? <IconLoader size={13} color="white" /> : <IconCheck size={13} color="white" />}
                                {creating ? "Creating..." : "Create Monitor"}
                            </button>
                        </div>
                    </form>
                )}

                {/* Monitors list */}
                {loading ? (
                    <p style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "3rem" }}>Loading monitors...</p>
                ) : monitors.length === 0 ? (
                    <div style={{ textAlign: "center", marginTop: "5rem", color: "var(--text-muted)" }}>
                        <IconBell size={36} color="var(--border-light)" style={{ display: "block", margin: "0 auto 0.75rem" }} />
                        <p style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.4rem" }}>No monitors yet</p>
                        <p style={{ fontSize: "0.82rem" }}>Create one to start getting automated research delivered to your inbox.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {monitors.map(m => (
                            <div key={m.id} style={{ background: "var(--bg-secondary)", border: `1px solid ${m.active ? "var(--border)" : "var(--border)"}`, borderLeft: `3px solid ${m.active ? SCHEDULE_COLORS[m.schedule] : "var(--border-light)"}`, borderRadius: 12, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", opacity: m.active ? 1 : 0.6 }}>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                                        <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text)", margin: 0 }}>{m.topic}</p>
                                        <span style={{ fontSize: "0.63rem", fontWeight: 700, padding: "0.1rem 0.45rem", borderRadius: 20, background: `${SCHEDULE_COLORS[m.schedule]}20`, color: SCHEDULE_COLORS[m.schedule], border: `1px solid ${SCHEDULE_COLORS[m.schedule]}40` }}>
                                            {SCHEDULE_LABELS[m.schedule]}
                                        </span>
                                        {!m.active && <span style={{ fontSize: "0.63rem", color: "var(--text-muted)", fontWeight: 600 }}>PAUSED</span>}
                                    </div>
                                    <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.73rem", color: "var(--text-muted)" }}>
                                        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                            <IconCalendar size={11} /> Next run: {formatNextRun(m.next_run)}
                                        </span>
                                        {m.last_run && <span>Last: {new Date(m.last_run).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                                        {m.last_score !== undefined && m.last_score > 0 && (
                                            <span style={{ color: m.last_score >= 7 ? "var(--success)" : "var(--warning)" }}>Score: {m.last_score}/10</span>
                                        )}
                                        <span>{m.email}</span>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                                    <button onClick={() => handleToggle(m)} title={m.active ? "Pause" : "Resume"}
                                        style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bg)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        {m.active ? <IconPause size={14} color="var(--text-muted)" /> : <IconPlay size={14} color="var(--accent)" />}
                                    </button>
                                    <button onClick={() => handleDelete(m.id)} title="Delete"
                                        style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bg)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <IconTrash size={14} color="var(--danger)" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
