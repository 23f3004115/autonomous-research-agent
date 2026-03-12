"use client";

import React, { createContext, useContext, useState, useRef, ReactNode, useEffect } from "react";
import { createClient } from "@/lib/supabase";

export type AgentStep = {
  agent: string;
  data: {
    sub_questions?: string[];
    score?: number;
    critique?: string;
    report?: string;
    trace?: { query: string; sources: { title: string; domain: string; url: string }[] }[];
  };
};

export type Phase = "idle" | "planning" | "searching" | "writing" | "reviewing" | "done" | "error";

export type ResearchSession = {
  id: string; // internal client-side id for tracking
  goal: string;
  phase: Phase;
  steps: AgentStep[];
  subQuestions: string[];
  report: string;
  score: number;
  error: string;
  startTime: number;
};

type ResearchContextType = {
  sessions: ResearchSession[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  startResearch: (goal: string) => string; // returns session ID
  removeSession: (id: string) => void;
};

const ResearchContext = createContext<ResearchContextType | null>(null);

const AGENT_PHASE: Record<string, Phase> = {
  planner: "planning", searcher: "searching", writer: "writing", critic: "reviewing",
};

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function ResearchProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  // Keep refs to actual websocket objects so we can close them if needed
  const wsRefs = useRef<Record<string, WebSocket>>({});

  const startResearch = (goal: string) => {
    if (!goal.trim()) return "";

    const id = generateId();
    
    // Create new session
    const newSession: ResearchSession = {
      id,
      goal,
      phase: "planning",
      steps: [],
      subQuestions: [],
      report: "",
      score: 0,
      error: "",
      startTime: Date.now(),
    };
    
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(id);

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
    const ws = new WebSocket(`${wsUrl}/ws/research`);
    wsRefs.current[id] = ws;

    ws.onopen = () => ws.send(JSON.stringify({ goal }));

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      
      setSessions(prevSessions => {
        return prevSessions.map(session => {
          if (session.id !== id) return session;
          
          let updated = { ...session };
          
          if (msg.type === "agent_update") {
            updated.steps = [...updated.steps, { agent: msg.agent, data: msg.data }];
            updated.phase = AGENT_PHASE[msg.agent] || "planning";
            if (msg.data.sub_questions?.length) updated.subQuestions = msg.data.sub_questions;
            if (msg.data.report) updated.report = msg.data.report;
            if (msg.data.score) updated.score = msg.data.score;
          }
          if (msg.type === "done") {
            updated.phase = "done";
            ws.close();
            delete wsRefs.current[id];
          }
          
          return updated;
        });
      });
    };

    ws.onerror = () => {
      setSessions(prev => prev.map(s => {
        if (s.id !== id) return s;
        return {
          ...s,
          phase: "error",
          error: "Connection to research agent failed. Please check backend."
        };
      }));
      delete wsRefs.current[id];
    };
    
    return id;
  };

  const removeSession = (id: string) => {
    // If it's still running, let's just close the WS
    if (wsRefs.current[id]) {
      wsRefs.current[id].close();
      delete wsRefs.current[id];
    }
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) setActiveSessionId(null);
  };

  return (
    <ResearchContext.Provider value={{ sessions, activeSessionId, setActiveSessionId, startResearch, removeSession }}>
      {children}
    </ResearchContext.Provider>
  );
}

export function useResearch() {
  const context = useContext(ResearchContext);
  if (!context) throw new Error("useResearch must be used within ResearchProvider");
  return context;
}
