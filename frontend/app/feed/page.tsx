"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getFeed, type FeedPost } from "../lib/api";

const POLL_INTERVAL_MS = 30_000;

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function extractHostname(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    return hostname;
  } catch {
    return url.slice(0, 30);
  }
}

function PostCard({ post, index }: { post: FeedPost; index: number }) {
  const [rationaleOpen, setRationaleOpen] = useState(false);

  // Extract title and body if post text contains TITLE header, else split first line
  let title = "";
  let bodyText = post.text;

  if (post.text.includes("\n")) {
    const lines = post.text.split("\n");
    if (lines[0].startsWith("TITLE:") || lines[0].length < 100) {
      title = lines[0].replace(/^TITLE:\s*/i, "").replace(/^#\s*/, "").trim();
      bodyText = lines.slice(1).join("\n").trim();
    }
  }

  return (
    <article
      className="post-card"
      style={{ animationDelay: `${Math.min(index * 80, 400)}ms` }}
    >
      {/* Header & Metadata */}
      <div className="post-header">
        <div className="post-meta-left">
          <span className="post-tag">Research</span>
          <span className="post-time">{formatTime(post.createdAt)}</span>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted2)", letterSpacing: "0.05em" }}>
          AUTONOMOUS CURATION
        </div>
      </div>

      {/* Article Title if present */}
      {title && <h2 className="post-title">{title}</h2>}

      {/* Main body text */}
      <p className="post-text">{bodyText}</p>

      {/* Rationale & Sources Accordion */}
      <div className="post-footer">
        <button
          className={`rationale-toggle ${rationaleOpen ? "open" : ""}`}
          onClick={() => setRationaleOpen((v) => !v)}
          type="button"
          aria-expanded={rationaleOpen}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>🧠</span>
            <span>Editorial Rationale &amp; Selection Criteria</span>
          </span>
          <span className="chevron">▾</span>
        </button>

        <div className={`rationale-body ${rationaleOpen ? "open" : ""}`}>
          <div className="rationale-content">
            <p>{post.rationale}</p>
          </div>
        </div>

        {/* Source Links */}
        {post.sources.length > 0 && (
          <div className="sources-section">
            <p className="sources-label">Validated Primary Sources</p>
            <div className="source-chips">
              {post.sources.map((src) => (
                <a
                  key={src}
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className="source-chip"
                  title={src}
                >
                  ↗ {extractHostname(src)}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getFeed();
        if (!cancelled) {
          setPosts(data.posts);
          setLastUpdated(new Date());
          setError(null);
        }
      } catch {
        if (!cancelled) setError("Couldn't reach the backend API.");
      }
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <main>
      {/* Navbar */}
      <nav className="topnav">
        <Link href="/" className="nav-logo">
          <span className="nav-logo-dot" />
          Aether
          <span className="nav-logo-badge">Autonomous</span>
        </Link>
        <div className="nav-links">
          <Link href="/" className={pathname === "/" ? "active" : ""}>Home</Link>
          <Link href="/feed" className={pathname === "/feed" ? "active" : ""}>Feed</Link>
        </div>
      </nav>

      {/* Header */}
      <div className="hero" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 38 }}>
          Autonomous Curation Feed
          <span className="live-badge">
            <span className="pulse-dot" style={{ width: 7, height: 7 }} />
            Live Sync
          </span>
        </h1>
        <p className="hero-sub" style={{ marginTop: 8 }}>
          Real-time AI research digest generated continuously by Aether. Zero human oversight or editing.
          {lastUpdated && (
            <span style={{ marginLeft: 12, fontSize: 12, color: "var(--muted2)" }}>
              Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </p>
      </div>

      {/* Error / Reconnecting state */}
      {error && (
        <div className="reconnect-banner">
          <span>⚡ Backend Server Offline or Reconnecting. Retrying feed sync every 30s.</span>
          <Link href="/" style={{ color: "var(--amber)", textDecoration: "underline", marginLeft: "auto" }}>
            Check Agent Control →
          </Link>
        </div>
      )}

      {/* Post count & Back link */}
      {posts.length > 0 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)" }}>
            Showing {posts.length} published research item{posts.length !== 1 ? "s" : ""}
          </p>
          <Link href="/" style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none", fontWeight: 700 }}>
            ← Back to Dashboard
          </Link>
        </div>
      )}

      {/* Empty state */}
      {!error && posts.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🤖</div>
          <h3>Autonomous Pipeline Initializing</h3>
          <p style={{ marginTop: 8 }}>
            No research posts published yet. Make sure the agent is initialized from the{" "}
            <Link href="/" style={{ color: "var(--accent)", fontWeight: 600 }}>home control panel</Link>.
            The scheduler will ingest candidates and publish posts automatically.
          </p>
        </div>
      )}

      {/* Posts */}
      {posts.map((post, i) => (
        <PostCard key={post.id} post={post} index={i} />
      ))}
    </main>
  );
}
