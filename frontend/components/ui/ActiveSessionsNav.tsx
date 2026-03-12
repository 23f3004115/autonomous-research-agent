"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useResearch } from "@/lib/ResearchContext";
import { IconFlask, IconLoader, IconCheck, IconChevronDown } from "./Icons";

export default function ActiveSessionsNav() {
  const { sessions, activeSessionId, setActiveSessionId } = useResearch();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const runningSessions = sessions.filter(s => s.phase !== "done" && s.phase !== "error");
  const count = runningSessions.length;

  if (sessions.length === 0) return null;

  return (
    <div ref={ref} style={{ position: "relative", marginLeft: "0.5rem" }}>
      <button 
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.3rem 0.6rem", 
          borderRadius: 6, fontSize: "0.75rem", fontWeight: 600, border: "1px solid var(--border)",
          background: "var(--bg-secondary)", color: count > 0 ? "var(--text)" : "var(--text-muted)",
          cursor: "pointer", transition: "all 0.2s"
        }}
      >
        {count > 0 ? <IconLoader size={12} color="var(--accent)" /> : <IconFlask size={12} />}
        Tasks ({count})
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "100%", right: 0, marginTop: "0.5rem", width: 280,
          background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)", overflow: "hidden", zIndex: 50,
          animation: "fadeUp 0.15s ease"
        }}>
          <div style={{ padding: "0.6rem 0.8rem", borderBottom: "1px solid var(--border)", fontSize: "0.75rem", fontWeight: 700 }}>
            Recent Tasks
          </div>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {sessions.slice().reverse().map(session => (
              <div 
                key={session.id} 
                onClick={() => {
                  setActiveSessionId(session.id);
                  if (window.location.pathname !== "/") {
                    router.push("/");
                  }
                  setOpen(false);
                }}
                style={{ 
                  padding: "0.6rem 0.8rem", borderBottom: "1px solid var(--border)", cursor: "pointer",
                  background: activeSessionId === session.id ? "rgba(255,255,255,0.03)" : "transparent",
                  transition: "background 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = activeSessionId === session.id ? "rgba(255,255,255,0.03)" : "transparent"}
              >
                <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "0.2rem" }}>
                  {session.goal}
                </div>
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", fontSize: "0.65rem" }}>
                  {session.phase === "done" ? (
                    <><IconCheck size={10} color="var(--success)" /> <span style={{ color: "var(--success)" }}>Done</span></>
                  ) : session.phase === "error" ? (
                    <span style={{ color: "var(--danger)" }}>Failed</span>
                  ) : (
                    <><IconLoader size={10} color="var(--accent)" /> <span style={{ color: "var(--accent)" }}>{session.phase.charAt(0).toUpperCase() + session.phase.slice(1)}...</span></>
                  )}
                  <span style={{ color: "var(--text-muted)" }}>· {new Date(session.startTime).toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"})}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
