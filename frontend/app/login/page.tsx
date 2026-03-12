"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { IconFlask, IconLoader } from "@/components/ui/Icons";

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            window.location.href = "/";
        }
    };

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: window.location.origin },
        });
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "1rem" }}>
            <div style={{ width: "100%", maxWidth: 400, animation: "fadeUp 0.4s ease" }}>

                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, var(--accent), #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.85rem", boxShadow: "0 8px 32px rgba(99,102,241,0.25)" }}>
                        <IconFlask size={24} color="white" />
                    </div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.35rem", letterSpacing: "-0.02em" }}>Welcome back</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Sign in to your Pulse account</p>
                </div>

                {/* Card */}
                <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1rem" }}>

                    {/* Google button */}
                    <button onClick={handleGoogleLogin} type="button"
                        style={{ width: "100%", padding: "0.7rem", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", transition: "all 0.2s", fontFamily: "inherit" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg)"; }}>
                        <GoogleIcon /> Continue with Google
                    </button>

                    {/* Divider */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>or</span>
                        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                    </div>

                    {/* Email form */}
                    <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                            <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                placeholder="you@example.com"
                                className="auth-input" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                            <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                                placeholder="••••••••"
                                className="auth-input" />
                        </div>

                        {error && (
                            <div style={{ background: "rgba(248,81,73,0.08)", border: "1px solid rgba(248,81,73,0.25)", borderRadius: 8, padding: "0.6rem 0.85rem", fontSize: "0.82rem", color: "var(--danger)" }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading || !email || !password}
                            className="auth-submit"
                            style={{ background: email && password ? "var(--accent)" : "var(--border)", cursor: email && password ? "pointer" : "not-allowed" }}>
                            {loading ? <><IconLoader size={14} color="white" /> Signing in...</> : "Sign In →"}
                        </button>
                    </form>

                    <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        Don't have an account?{" "}
                        <a href="/signup" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>Sign up</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
