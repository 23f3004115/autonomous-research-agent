"use client";
import { useState, useRef } from "react";
import AgentSidebar from "@/components/ui/AgentSidebar";
import ReportView from "@/components/ui/ReportView";
import { IconFlask, IconHistory, IconLoader } from "@/components/ui/Icons";

type AgentStep = {
  agent: string;
  data: { sub_questions?: string[]; score?: number; critique?: string; report?: string };
};

type Phase = "idle" | "planning" | "searching" | "writing" | "reviewing" | "done";

const PHASES: { key: Phase; label: string }[] = [
  { key: "planning", label: "Planning" },
  { key: "searching", label: "Searching" },
  { key: "writing", label: "Writing" },
  { key: "reviewing", label: "Reviewing" },
];

const AGENT_PHASE: Record<string, Phase> = {
  planner: "planning", searcher: "searching", writer: "writing", critic: "reviewing",
};

export default function Home() {
  const [goal, setGoal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [subQuestions, setSubQ] = useState<string[]>([]);
  const [report, setReport] = useState("");
  const [score, setScore] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);

  const startResearch = () => {
    if (!goal.trim() || isLoading) return;
    setSteps([]); setReport(""); setScore(0); setSubQ([]); setPhase("planning");
    setIsLoading(true);

    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws/research`);
    wsRef.current = ws;

    ws.onopen = () => ws.send(JSON.stringify({ goal }));

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "agent_update") {
        setSteps(prev => [...prev, { agent: msg.agent, data: msg.data }]);
        setPhase(AGENT_PHASE[msg.agent] || "planning");
        if (msg.data.sub_questions?.length) setSubQ(msg.data.sub_questions);
        if (msg.data.report) setReport(msg.data.report);
        if (msg.data.score) setScore(msg.data.score);
      }
      if (msg.type === "done") { setIsLoading(false); setPhase("done"); ws.close(); }
    };

    ws.onerror = () => { setIsLoading(false); setPhase("idle"); };
  };

  const phaseIdx = PHASES.findIndex(p => p.key === phase);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>

      {/* Header */}
      <header style={{ padding: "0 1.5rem", height: 52, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconFlask size={15} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>ResearchAgent</span>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          {(["Dashboard", "Active Execution", "History"] as const).map((item, i) => {
            const href = i === 2 ? "/history" : "/";
            const isActive = i === 1 && phase !== "idle";
            return (
              <a key={item} href={href}
                onClick={e => {
                  if (isLoading) {
                    e.preventDefault();
                    if (window.confirm("Research is still running. Navigate away and stop it?")) window.location.href = href;
                  }
                }}
                style={{ padding: "0.3rem 0.75rem", borderRadius: 6, fontSize: "0.8rem", color: isActive ? "white" : "var(--text-muted)", background: isActive ? "var(--accent)" : "transparent", textDecoration: "none", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                {i === 2 && <IconHistory size={13} />}
                {item}
              </a>
            );
          })}
        </nav>
      </header>

      {/* Progress tracker — shows when running */}
      {phase !== "idle" && (
        <div style={{ padding: "0.75rem 1.5rem", borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            {PHASES.map((p, i) => {
              const done = i < phaseIdx || phase === "done";
              const active = p.key === phase && isLoading;
              const pending = !done && !active;
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
        <div style={{ width: 300, borderRight: "1px solid var(--border)", flexShrink: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <AgentSidebar steps={steps} isLoading={isLoading} />
        </div>

        {/* Right content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>

          {/* Input form — shown at idle or after done */}
          {(phase === "idle" || phase === "done") && (
            <div style={{ maxWidth: 680, margin: "0 auto", paddingTop: phase === "idle" ? "3rem" : "0" }}>
              {phase === "idle" && (
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                  <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "0.5rem" }}>Autonomous Research Agent</h1>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Enter any research goal. Multi-agent AI will search, synthesize, and critique the results.</p>
                </div>
              )}
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem" }}>
                <textarea value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. Analyze the competitive landscape of AI coding tools in 2026..." rows={3}
                  style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.75rem", color: "var(--text)", fontSize: "0.9rem", resize: "none", outline: "none", marginBottom: "0.75rem", fontFamily: "inherit" }}
                  onKeyDown={e => { if (e.key === "Enter" && e.metaKey) startResearch(); }} />
                <button onClick={startResearch} disabled={!goal.trim()}
                  style={{ width: "100%", padding: "0.65rem", background: goal.trim() ? "var(--accent)" : "var(--border)", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: "0.88rem", cursor: goal.trim() ? "pointer" : "not-allowed", transition: "background 0.2s" }}>
                  Start Research →
                </button>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.4rem", textAlign: "center" }}>⌘ + Enter to submit</p>
              </div>
            </div>
          )}

          {/* Show "Researching..." message while loading */}
          {isLoading && (
            <div style={{ maxWidth: 680, margin: "0 auto" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <IconLoader size={13} color="var(--accent)" />
                Researching: <strong style={{ color: "var(--text)" }}>{goal}</strong>
              </p>
            </div>
          )}

          {/* Report */}
          {report && (
            <div style={{ marginTop: "1.5rem" }}>
              <ReportView report={report} score={score} subQuestions={subQuestions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
