"use client";
import { IconBrain, IconSearch, IconEdit, IconScale, IconCheck, IconBot, IconLoader } from "./Icons";

type AgentStep = {
    agent: string;
    data: { sub_questions?: string[]; score?: number; critique?: string; report?: string };
};

type Iteration = { searcher: boolean; writer: boolean; critic: boolean; score: number };

function groupIntoIterations(steps: AgentStep[], isLoading: boolean) {
    const planner = steps.find(s => s.agent === "planner");
    const rounds: Iteration[] = [];
    let current: Iteration | null = null;
    let lastAgent = "";

    for (const step of steps) {
        lastAgent = step.agent;
        if (step.agent === "searcher") {
            if (current) rounds.push(current);
            current = { searcher: true, writer: false, critic: false, score: 0 };
        } else if (step.agent === "writer" && current) {
            current.writer = true;
        } else if (step.agent === "critic" && current) {
            current.critic = true;
            current.score = step.data.score ?? 0;
        }
    }
    if (current) rounds.push(current);

    // If still loading and waiting for a new searcher pass, inject a pending round
    if (isLoading && (lastAgent === "planner" || lastAgent === "critic")) {
        rounds.push({ searcher: false, writer: false, critic: false, score: 0 });
    }

    return { planner, rounds };
}

const AGENT_ICONS = {
    planner: { Icon: IconBrain, color: "var(--planner)" },
    searcher: { Icon: IconSearch, color: "var(--searcher)" },
    writer: { Icon: IconEdit, color: "var(--writer)" },
    critic: { Icon: IconScale, color: "var(--critic)" },
};

export default function AgentSidebar({ steps, isLoading }: { steps: AgentStep[]; isLoading: boolean }) {
    const { planner, rounds } = groupIntoIterations(steps, isLoading);

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

            {/* Header */}
            <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
                    Agent Activity
                </span>
                {isLoading && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <IconLoader size={12} color="var(--accent)" />
                        <span style={{ fontSize: "0.68rem", color: "var(--accent)" }}>Running</span>
                    </div>
                )}
            </div>

            {/* Timeline */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
                {steps.length === 0 && !isLoading && (
                    <div style={{ textAlign: "center", marginTop: "3rem", color: "var(--text-muted)" }}>
                        <IconBot size={32} color="var(--border-light)" style={{ margin: "0 auto 0.5rem" }} />
                        <p style={{ fontSize: "0.8rem" }}>Agent steps will appear here</p>
                    </div>
                )}

                <div style={{ position: "relative" }}>
                    {/* Planner */}
                    {planner && (
                        <TimelineItem
                            icon={<IconBrain size={12} color="var(--planner)" />}
                            color="var(--planner)"
                            label="Planner"
                            detail={planner.data.sub_questions?.length ? `Decomposed into ${planner.data.sub_questions.length} sub-queries` : "Planning..."}
                            showLine={rounds.length > 0}
                        >
                            {planner.data.sub_questions && (
                                <div style={{ marginTop: "0.35rem", background: "var(--bg)", borderRadius: 6, padding: "0.4rem 0.5rem" }}>
                                    {planner.data.sub_questions.map((q, i) => (
                                        <div key={i} style={{ fontSize: "0.68rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: i < planner.data.sub_questions!.length - 1 ? "0.15rem" : 0 }}>
                                            {i + 1}. {q}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TimelineItem>
                    )}

                    {/* Rounds */}
                    {rounds.map((round, ri) => {
                        const isLastRound = ri === rounds.length - 1;
                        const passed = round.score >= 6;
                        return (
                            <div key={ri}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", margin: "0.6rem 0 0.4rem 0" }}>
                                    <div style={{ width: 1, height: 12, background: "var(--border)", marginLeft: 10 }} />
                                    <span style={{
                                        fontSize: "0.63rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                                        padding: "0.1rem 0.5rem", borderRadius: 10,
                                        background: passed && round.critic ? "var(--success-dim)" : "var(--bg)",
                                        border: `1px solid ${passed && round.critic ? "rgba(63,185,80,0.3)" : "var(--border)"}`,
                                        color: passed && round.critic ? "var(--success)" : "var(--text-muted)",
                                    }}>
                                        {ri === 0 ? "Round 1" : `Retry ${ri}`}
                                    </span>
                                </div>

                                <div style={{ paddingLeft: "1.1rem", borderLeft: "1px solid var(--border)", marginLeft: "0.6rem" }}>
                                    <CompactStep icon={<IconSearch size={11} color="var(--searcher)" />} label="Searcher" color="var(--searcher)" done={round.searcher} active={isLastRound && isLoading && !round.searcher} />
                                    <CompactStep icon={<IconEdit size={11} color="var(--writer)" />} label="Writer" color="var(--writer)" done={round.writer} active={isLastRound && isLoading && round.searcher && !round.writer} />
                                    <CompactStep icon={<IconScale size={11} color="var(--critic)" />} label="Critic" color="var(--critic)" done={round.critic} active={isLastRound && isLoading && round.writer && !round.critic}
                                        badge={round.score > 0 ? { score: round.score, passed } : undefined}
                                    />
                                </div>
                            </div>
                        );
                    })}

                    {!isLoading && rounds.length > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.75rem" }}>
                            <div style={{ width: 1, height: 12, background: "var(--border)", marginLeft: 10 }} />
                            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                <IconCheck size={11} color="var(--success)" />
                                <span style={{ fontSize: "0.68rem", color: "var(--success)", fontWeight: 600 }}>Research complete</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TimelineItem({ icon, label, color, detail, showLine, children }: {
    icon: React.ReactNode; label: string; color: string; detail: string;
    showLine?: boolean; children?: React.ReactNode;
}) {
    return (
        <div style={{ display: "flex", gap: "0.5rem", animation: "fadeUp 0.3s ease" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: `${color}18`, border: `1.5px solid ${color}50`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {icon}
                </div>
                {showLine && <div style={{ width: 1, flex: 1, minHeight: 8, background: "var(--border)", marginTop: 2 }} />}
            </div>
            <div style={{ paddingBottom: "0.5rem", flex: 1 }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color }}>{label}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{detail}</div>
                {children}
            </div>
        </div>
    );
}

function CompactStep({ icon, label, color, done, active, badge }: {
    icon: React.ReactNode; label: string; color: string; done: boolean; active: boolean;
    badge?: { score: number; passed: boolean };
}) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", padding: "0.22rem 0", animation: done ? "fadeUp 0.25s ease" : "none", opacity: done || active ? 1 : 0.3 }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: done ? `${color}15` : "var(--bg)", border: `1.5px solid ${done || active ? color + "50" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {done || active ? icon : <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--border-light)", display: "inline-block" }} />}
            </div>
            <span style={{ fontSize: "0.72rem", color: done ? "var(--text)" : active ? color : "var(--text-muted)", fontWeight: done || active ? 500 : 400, flex: 1 }}>
                {label}
                {active && <span style={{ marginLeft: "0.3rem", fontSize: "0.63rem", color: "var(--accent)" }}>running...</span>}
            </span>
            {badge && (
                <span style={{ fontSize: "0.63rem", fontWeight: 700, padding: "0.05rem 0.4rem", borderRadius: 10, background: badge.passed ? "var(--success-dim)" : "var(--warning-dim)", color: badge.passed ? "var(--success)" : "var(--warning)", border: `1px solid ${badge.passed ? "rgba(63,185,80,0.3)" : "rgba(210,153,34,0.3)"}` }}>
                    {badge.score}/10
                </span>
            )}
        </div>
    );
}
