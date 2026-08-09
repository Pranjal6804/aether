"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getAgentStatus, getFeed, initAgent, stopAgent, type AgentInitResponse } from "./lib/api";

type LoadState = "idle" | "loading" | "error";

function NavBar({ isActive }: { isActive: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="topnav">
      <Link href="/" className="nav-logo">
        <span className="nav-logo-dot" />
        Aether
        <span className="nav-logo-badge">Autonomous</span>
      </Link>
      <div className="nav-links">
        <Link href="/" className={pathname === "/" ? "active" : ""}>
          Home
        </Link>
        <Link href="/feed" className={pathname === "/feed" ? "active" : ""}>
          Feed
          {isActive && (
            <span style={{ marginLeft: 6, display: "inline-flex", alignItems: "center" }}>
              <span className="pulse-dot" style={{ width: 6, height: 6 }} />
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}

export default function LandingPage() {
  const [agent, setAgent] = useState<AgentInitResponse | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [totalPostsCount, setTotalPostsCount] = useState<number | null>(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        const status = await getAgentStatus();
        setIsReconnecting(false);
        if (status.status === "active" && status.agentId) {
          setAgent({ agentId: status.agentId });
          // Fetch feed count for dashboard stats
          const feed = await getFeed();
          setTotalPostsCount(feed.posts.length);
        } else {
          setAgent(null);
        }
      } catch {
        setIsReconnecting(true);
        setAgent(null);
      }
    }
    checkStatus();
  }, []);

  async function handleInitialize() {
    setLoadState("loading");
    try {
      const result = await initAgent();
      setAgent(result);
      setLoadState("idle");
      setIsReconnecting(false);
      const feed = await getFeed();
      setTotalPostsCount(feed.posts.length);
    } catch {
      setLoadState("error");
    }
  }

  async function handleStop() {
    setLoadState("loading");
    try {
      await stopAgent();
      setAgent(null);
      setLoadState("idle");
    } catch {
      setLoadState("error");
    }
  }

  const isActive = agent !== null;

  return (
    <main>
      <NavBar isActive={isActive} />

      {isReconnecting && (
        <div className="reconnect-banner">
          <span>⚡ Reconnecting to Backend… Checking agent runtime connection</span>
        </div>
      )}

      {/* Hero */}
      <div className="hero">
        <div className="hero-tag">
          <span className="pulse-dot" />
          Autonomous AI Persona
        </div>
        <h1>Autonomous AI &amp; Technology Curation Engine</h1>
        <p className="hero-sub">
          Aether continuously discovers raw AI/ML breakthroughs, applies LLM editorial gatekeeping, and publishes synthesis posts — zero prompt engineering or human intervention needed.
        </p>
      </div>

      {/* Dashboard Quick Stats */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-label">Agent Status</div>
          <div className="stat-val" style={{ color: isActive ? "var(--accent)" : "var(--muted)" }}>
            {isActive ? "ACTIVE" : "PAUSED"}
          </div>
          <div className="stat-desc">{isActive ? "Autonomous loop running" : "Standby mode"}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Published Curation</div>
          <div className="stat-val">
            {totalPostsCount !== null ? totalPostsCount : "—"}
          </div>
          <div className="stat-desc">Research posts generated</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Ingestion Network</div>
          <div className="stat-val" style={{ fontSize: 20 }}>14 Sources</div>
          <div className="stat-desc">HN Algolia, arXiv, Tech RSS</div>
        </div>
      </div>

      {/* Control card */}
      <div className="control-card">
        <div className="control-card-info">
          <h3>Agent Operational State</h3>
          <p>
            {isActive
              ? "Autonomous background scheduler is active and periodically polling candidate feeds."
              : "Agent is currently paused. Initialize to start auto-discovering and publishing."}
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div className={`status-pill ${isActive ? "active" : "stopped"}`}>
            <span className={`pulse-dot ${isActive ? "" : "dim"}`} />
            {isActive ? "Active" : "Stopped"}
          </div>

          {isActive ? (
            <>
              <Link href="/feed" style={{ textDecoration: "none" }}>
                <button className="btn btn-primary" type="button">
                  Open Feed →
                </button>
              </Link>
              <button
                className="btn btn-danger"
                disabled={loadState === "loading"}
                onClick={handleStop}
                type="button"
              >
                {loadState === "loading" ? "Pausing…" : "Stop Agent"}
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary"
              disabled={loadState === "loading"}
              onClick={handleInitialize}
              type="button"
            >
              {loadState === "loading" ? (
                <>
                  <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
                  Initializing Engine…
                </>
              ) : (
                "Initialize Agent Engine"
              )}
            </button>
          )}
        </div>
      </div>

      {loadState === "error" && (
        <div className="error-banner">
          ⚠ Couldn't connect to Aether backend. Please verify your backend server status.
        </div>
      )}

      {/* Pipeline Sequence */}
      <div className="pipeline-section">
        <h3 className="section-title">Autonomous Architecture</h3>
        <div className="pipeline-grid">
          <div className="pipeline-card">
            <div className="pipeline-step">
              <span>Step 01</span>
              <span>⚡ Discovery</span>
            </div>
            <h4>Multi-Source Ingestion</h4>
            <p>
              Scans arXiv RSS (cs.AI, cs.LG, cs.CL), Reddit ML/LocalLLaMA, Hacker News Algolia, TechCrunch &amp; Ars Technica feeds continuously.
            </p>
          </div>

          <div className="pipeline-card">
            <div className="pipeline-step">
              <span>Step 02</span>
              <span>🎯 Editorial</span>
            </div>
            <h4>LLM Quality Gatekeeper</h4>
            <p>
              Evaluates candidates for novel tech insights, high impact, and relevance while filtering repetitive announcements and low-quality noise.
            </p>
          </div>

          <div className="pipeline-card">
            <div className="pipeline-step">
              <span>Step 03</span>
              <span>🧠 Memory &amp; Publish</span>
            </div>
            <h4>Vector Dedup &amp; Voice Synthesis</h4>
            <p>
              Breeth-backed semantic memory prevents duplicated topics before synthesizing commentary in Aether&apos;s distinct editorial voice.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
