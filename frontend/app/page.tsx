"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import AgentSidebar from "@/components/ui/AgentSidebar";
import ReportView from "@/components/ui/ReportView";
import ActiveSessionsNav from "@/components/ui/ActiveSessionsNav";
import { IconFlask, IconHistory, IconLoader, IconBell } from "@/components/ui/Icons";
import { useResearch, Phase } from "@/lib/ResearchContext";

const PHASES: { key: Phase; label: string }[] = [
  { key: "planning", label: "Planning" },
  { key: "searching", label: "Searching" },
  { key: "writing", label: "Writing" },
  { key: "reviewing", label: "Reviewing" },
];

export default function Home() {
  const [goal, setGoal] = useState("");
  const supabase = createClient();
  const { sessions, activeSessionId, startResearch, setActiveSessionId } = useResearch();

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;
  const phase = activeSession?.phase || "idle";
  const steps = activeSession?.steps || [];
  const report = activeSession?.report || "";
  const subQuestions = activeSession?.subQuestions || [];
  const score = activeSession?.score || 0;
  const error = activeSession?.error || "";
  
  const isLoading = phase !== "idle" && phase !== "done" && phase !== "error";

  const handleStart = () => {
    if (!goal.trim()) return;
    startResearch(goal);
    setGoal(""); // Clear input so they can type another
  };

  const currentGoalRendered = activeSession?.goal || goal;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const phaseIdx = PHASES.findIndex(p => p.key === phase);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>

      {/* Header */}
      <header className="no-print" style={{ padding: "0 1.5rem", height: 52, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "rgba(13, 17, 23, 0.8)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconFlask size={15} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Pulse</span>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          {(["Research", "History", "Monitors"] as const).map((item, i) => {
            const href = i === 0 ? "/" : i === 1 ? "/history" : "/monitors";
            const isActive = i === 0 && (phase === "idle" || phase === "done" || isLoading);
            return (
              <Link key={item} href={href}
                onClick={(e) => {
                  if (i === 0) {
                    // For Research link, just clear active session to show input form
                    setActiveSessionId(null);
                  }
                }}
                style={{ padding: "0.3rem 0.75rem", borderRadius: 6, fontSize: "0.8rem", color: isActive ? "white" : "var(--text-muted)", background: isActive ? "var(--accent)" : "transparent", textDecoration: "none", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                {i === 1 && <IconHistory size={13} />}
                {i === 2 && <IconBell size={13} />}
                {item}
              </Link>
            );
          })}
          
          <div style={{ width: 1, height: 16, background: "var(--border)", margin: "0 0.5rem" }} />
          <ActiveSessionsNav />
          
          <button onClick={handleLogout} style={{ padding: "0.3rem 0.75rem", borderRadius: 6, fontSize: "0.8rem", color: "var(--text-muted)", background: "transparent", border: "1px solid var(--border)", cursor: "pointer", marginLeft: "0.25rem" }}>
            Sign out
          </button>
        </nav>
      </header>

      {/* Progress tracker — shows when running */}
      {phase !== "idle" && phase !== "error" && (
        <div style={{ padding: "0.75rem 1.5rem", borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            {PHASES.map((p, i) => {
              const done = i < phaseIdx || phase === "done";
              const active = p.key === phase && isLoading;
              return (
                <div key={p.key} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "0.35rem",
                    padding: "0.25rem 0.7rem", borderRadius: 20,
                    fontSize: "0.72rem", fontWeight: 600,
                    transition: "all 0.3s ease",
                    background: done ? "var(--success-dim)" : active ? "var(--accent-dim)" : "transparent",
                    border: `1px solid ${done ? "rgba(63,185,80,0.3)" : active ? "var(--accent-border)" : "var(--border)"}`,
                    color: done ? "var(--success)" : active ? "var(--accent)" : "var(--text-muted)",
                  }}>
                    {done
                      ? <span style={{ fontSize: "0.65rem" }}>✓</span>
                      : active
                        ? <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block", animation: "pulse 1s ease-in-out infinite" }} />
                        : <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--border-light)", display: "inline-block" }} />
                    }
                    {p.label}
                  </div>
                  {i < PHASES.length - 1 && (
                    <div style={{ width: 20, height: 1, background: done ? "var(--success)" : "var(--border)", transition: "background 0.4s" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Left sidebar */}
        <div className="no-print" style={{ width: 300, borderRight: "1px solid var(--border)", flexShrink: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <AgentSidebar steps={steps} isLoading={isLoading} />
        </div>

        {/* Right content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>

          {/* Input form — shown at idle or after done */}
          {(!activeSession || phase === "done") && (
            <div style={{ maxWidth: 680, margin: "0 auto", paddingTop: !activeSession ? "3rem" : "0" }}>
              {!activeSession && (
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                  <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "0.5rem" }}>Pulse Research Agent</h1>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Enter any research goal. 4 AI agents will plan, search, write, and critique until it&apos;s great.</p>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1rem", flexWrap: "wrap" }}>
                    {[
                      "AI coding assistants market 2026",
                      "OpenAI vs Anthropic vs Google: who's winning?",
                      "Best open-source LLMs to run locally",
                    ].map(s => (
                      <button key={s} onClick={() => setGoal(s)}
                        style={{ padding: "0.3rem 0.75rem", fontSize: "0.75rem", borderRadius: 20, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-muted)", cursor: "pointer", transition: "border-color 0.15s, color 0.15s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
                      >{s}</button>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem" }}>
                <textarea value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. Analyze the competitive landscape of AI coding tools in 2026..." rows={3}
                  style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.75rem", color: "var(--text)", fontSize: "0.9rem", resize: "none", outline: "none", marginBottom: "0.75rem", fontFamily: "inherit" }}
                  onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handleStart(); }} />
                <button onClick={handleStart} disabled={!goal.trim()}
                  style={{ width: "100%", padding: "0.65rem", background: goal.trim() ? "var(--accent)" : "var(--border)", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: "0.88rem", cursor: goal.trim() ? "pointer" : "not-allowed", transition: "background 0.2s" }}>
                  Start Research →
                </button>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.4rem", textAlign: "center" }}>⌘ + Enter to submit</p>
              </div>
              {error && (
                <div style={{ marginTop: "0.75rem", background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.3)", borderRadius: 8, padding: "0.7rem 0.9rem", fontSize: "0.82rem", color: "var(--danger)" }}>{error}</div>
              )}
            </div>
          )}

          {/* Show "Researching..." message while loading */}
          {isLoading && (
            <div style={{ maxWidth: 680, margin: "0 auto" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <IconLoader size={13} color="var(--accent)" />
                Researching: <strong style={{ color: "var(--text)" }}>{currentGoalRendered}</strong>
              </p>
            </div>
          )}

          {/* Report */}
          {report && (
            <div style={{ marginTop: "1.5rem" }}>
              <ReportView report={report} score={score} subQuestions={subQuestions} goal={currentGoalRendered} />

              {phase === "done" && (
                <div style={{ maxWidth: 680, margin: "1.5rem auto 0", background: "var(--accent-dim)", border: "1px solid var(--accent-border)", borderRadius: 10, padding: "0.9rem 1.1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--accent)", flex: 1 }}>Want to track this topic over time? <strong>Set up a Monitor</strong> to get weekly research delivered to your inbox.</span>
                  <Link href="/monitors" style={{ padding: "0.4rem 0.9rem", background: "var(--accent)", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: "0.78rem", textDecoration: "none", whiteSpace: "nowrap" }}>+ New Monitor</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
