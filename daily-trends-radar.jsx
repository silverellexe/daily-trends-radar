import { useState, useEffect, useRef } from "react";

const BRANDS = [
  { name: "KFC", handle: "@kaborekfc", category: "F&B" },
  { name: "TheLittleThings", handle: "@thelittlethings.ae", category: "UAE" },
  { name: "Comic Cave", handle: "@comiccave", category: "Pop Culture" },
  { name: "Comic Con", handle: "@comiccon", category: "Pop Culture" },
  { name: "Duolingo", handle: "@duolingo", category: "Tech" },
  { name: "Ryanair", handle: "@ryanair", category: "Travel" },
  { name: "KitKat", handle: "@kitkat", category: "F&B" },
  { name: "Wendy's", handle: "@wendys", category: "F&B" },
  { name: "Chipotle", handle: "@chipotle", category: "F&B" },
  { name: "Netflix", handle: "@netflix", category: "Entertainment" },
  { name: "Scrub Daddy", handle: "@scrubdaddy", category: "Lifestyle" },
  { name: "Liquid Death", handle: "@liquiddeath", category: "F&B" },
];

const CATEGORIES = [
  "Pop Culture & Anime",
  "Music & Festivals",
  "Memes & Viral Moments",
  "Awareness Days & Events",
  "Brand Activations",
  "Sports & Gaming",
  "Current Affairs",
  "UAE & MENA Trends",
];

const PLATFORMS = ["TikTok", "Instagram", "Twitter/X"];

const systemPrompt = `You are an elite social media trend analyst working for a creative agency. Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.

Your job: do MULTIPLE web searches to find what is trending RIGHT NOW across social media and news. You MUST search for ALL of these separately:

1. Search "trending on TikTok today" and "TikTok viral today"
2. Search "trending on Twitter today" and "Twitter X trending topics"  
3. Search "trending memes today" and "viral memes this week"
4. Search "sports news today" and "esports gaming news today"
5. Search "brand social media campaigns today" and "best brand tweets this week"
6. Search "world news today" and "current affairs today"
7. Search "UAE news today" and "Dubai trending"
8. Search "anime news today" and "comic con 2025 2026 news"
9. Search "music festivals concerts today this week"
10. Search "awareness days today ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}"
11. Search "Duolingo social media" and "Ryanair social media" and "KFC social media"
12. Search "viral Instagram reels today"

Do ALL these searches. Then compile results into JSON.

CRITICAL RULES:
- You MUST have at least 2-3 items in EVERY category. No empty categories allowed.
- You MUST have at least 15-20 trending items total.
- You MUST have at least 5-8 brand moves.
- For "Memes & Viral Moments" — find actual viral memes, TikTok sounds, trending audio, reaction formats
- For "Sports & Gaming" — find actual sports results, upcoming matches, gaming/esports news, game releases
- For "Brand Activations" — find real brand campaigns, collabs, product drops, stunts happening now
- For "Current Affairs" — find real breaking news, political events, economic news, tech announcements
- For velocity: RISING = appeared in last 24hrs and growing. PEAKING = at maximum buzz right now. FADING = was big but declining.
- Be SPECIFIC — real names, real events, real memes. Never make things up.

The tracked brands are: KFC, TheLittleThings (UAE), Comic Cave, Comic Con, Duolingo, Ryanair, KitKat, Wendy's, Chipotle, Netflix, Scrub Daddy, Liquid Death

After ALL searches are complete, return ONLY valid JSON (no markdown, no backticks, no extra text before or after):
{
  "date": "today's date",
  "trending": [
    {
      "topic": "specific trend name",
      "category": "one of: Pop Culture & Anime | Music & Festivals | Memes & Viral Moments | Awareness Days & Events | Brand Activations | Sports & Gaming | Current Affairs | UAE & MENA Trends",
      "platforms": ["TikTok", "Instagram", "Twitter/X"],
      "description": "what's happening in 1-2 sentences with specific details",
      "velocity": "RISING or PEAKING or FADING",
      "opportunity": "specific actionable content idea a brand could post RIGHT NOW",
      "relevantBrands": ["which tracked brands should jump on this"]
    }
  ],
  "brandMoves": [
    {
      "brand": "brand name",
      "action": "specific thing they posted or did",
      "platform": "TikTok or Instagram or Twitter/X",
      "takeaway": "what other brands can learn from this"
    }
  ],
  "todayIs": ["every awareness day, holiday, observance for today"],
  "upcomingEvents": ["specific events in the next 7 days with dates"]
}`;

// Animated radar sweep component
function RadarSweep({ isScanning }) {
  return (
    <div style={{
      width: 120, height: 120, borderRadius: "50%", position: "relative",
      background: "radial-gradient(circle, rgba(0,255,136,0.05) 0%, transparent 70%)",
      border: "1px solid rgba(0,255,136,0.2)", margin: "0 auto",
    }}>
      {[1,2,3].map(i => (
        <div key={i} style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: `1px solid rgba(0,255,136,${0.1 * i})`,
          transform: `scale(${0.3 + i * 0.23})`,
        }}/>
      ))}
      {isScanning && (
        <div style={{
          position: "absolute", top: "50%", left: "50%", width: "50%", height: 2,
          background: "linear-gradient(90deg, rgba(0,255,136,0.8), transparent)",
          transformOrigin: "0 50%",
          animation: "sweep 2s linear infinite",
        }}/>
      )}
      <div style={{
        position: "absolute", top: "50%", left: "50%", width: 8, height: 8,
        background: "#00ff88", borderRadius: "50%", transform: "translate(-50%,-50%)",
        boxShadow: "0 0 12px rgba(0,255,136,0.6)",
      }}/>
    </div>
  );
}

function VelocityBadge({ velocity }) {
  const config = {
    RISING: { color: "#00ff88", bg: "rgba(0,255,136,0.1)", icon: "↗", label: "RISING" },
    PEAKING: { color: "#ff6b35", bg: "rgba(255,107,53,0.1)", icon: "⚡", label: "PEAKING" },
    FADING: { color: "#888", bg: "rgba(136,136,136,0.1)", icon: "↘", label: "FADING" },
  };
  const c = config[velocity] || config.RISING;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px",
      borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 1,
      color: c.color, background: c.bg, border: `1px solid ${c.color}33`,
    }}>
      {c.icon} {c.label}
    </span>
  );
}

function PlatformTag({ name }) {
  const colors = {
    "TikTok": "#ff0050",
    "Instagram": "#e1306c",
    "Twitter/X": "#1da1f2",
  };
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 4,
      fontSize: 10, fontWeight: 600, color: colors[name] || "#aaa",
      background: `${colors[name] || "#aaa"}15`, border: `1px solid ${colors[name] || "#aaa"}30`,
    }}>
      {name}
    </span>
  );
}

function TrendCard({ trend, index }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 12, padding: 18, cursor: "pointer",
        transition: "all 0.2s ease",
        borderLeft: trend.velocity === "RISING" ? "3px solid #00ff88"
          : trend.velocity === "PEAKING" ? "3px solid #ff6b35" : "3px solid #444",
        animation: `fadeSlideIn 0.4s ease ${index * 0.05}s both`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.02)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f0" }}>{trend.topic}</span>
            <VelocityBadge velocity={trend.velocity} />
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
            {(trend.platforms || []).map(p => <PlatformTag key={p} name={p} />)}
            <span style={{
              display: "inline-block", padding: "2px 8px", borderRadius: 4,
              fontSize: 10, fontWeight: 500, color: "#aaa",
              background: "rgba(255,255,255,0.04)",
            }}>
              {trend.category}
            </span>
          </div>
          <p style={{ color: "#999", fontSize: 13, lineHeight: 1.5, margin: 0 }}>
            {trend.description}
          </p>
        </div>
      </div>

      {expanded && (
        <div style={{
          marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#00ff88", letterSpacing: 1, marginBottom: 4 }}>
              💡 OPPORTUNITY
            </div>
            <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.5, margin: 0 }}>
              {trend.opportunity}
            </p>
          </div>
          {trend.relevantBrands && trend.relevantBrands.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#ff6b35", letterSpacing: 1, marginBottom: 6 }}>
                RELEVANT BRANDS
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {trend.relevantBrands.map(b => (
                  <span key={b} style={{
                    padding: "3px 10px", borderRadius: 20, fontSize: 11,
                    color: "#f0f0f0", background: "rgba(255,107,53,0.1)",
                    border: "1px solid rgba(255,107,53,0.2)",
                  }}>{b}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BrandMoveCard({ move, index }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 12, padding: 16,
      animation: `fadeSlideIn 0.4s ease ${index * 0.08}s both`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f0" }}>{move.brand}</span>
        <PlatformTag name={move.platform} />
      </div>
      <p style={{ color: "#999", fontSize: 13, lineHeight: 1.5, margin: "0 0 8px 0" }}>
        {move.action}
      </p>
      <div style={{
        padding: "8px 12px", borderRadius: 8, background: "rgba(0,255,136,0.04)",
        border: "1px solid rgba(0,255,136,0.1)", fontSize: 12, color: "#00ff88",
      }}>
        📝 {move.takeaway}
      </div>
    </div>
  );
}

export default function TrendsRadar() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activePlatform, setActivePlatform] = useState("All");
  const [activeTab, setActiveTab] = useState("trends");
  const [loadingMessage, setLoadingMessage] = useState("");
  const loadingMessages = [
    "Scanning TikTok for viral moments...",
    "Checking Twitter/X trending topics...",
    "Analyzing Instagram explore page...",
    "Cross-referencing brand activity...",
    "Identifying rising trends before they peak...",
    "Filtering for UAE & MENA relevance...",
    "Compiling your daily brief...",
  ];
  const msgInterval = useRef(null);

  const callAPI = async (messages) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 16000,
        system: systemPrompt,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages,
      }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`API error ${res.status}: ${errBody.slice(0, 200)}`);
    }
    return res.json();
  };

  const extractJSON = (text) => {
    // Try direct parse
    try { return JSON.parse(text.trim()); } catch {}
    // Remove markdown fences and try
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    try { return JSON.parse(cleaned); } catch {}
    // Find the largest JSON object in text
    const matches = [];
    let depth = 0, start = -1;
    for (let i = 0; i < cleaned.length; i++) {
      if (cleaned[i] === '{') { if (depth === 0) start = i; depth++; }
      else if (cleaned[i] === '}') { depth--; if (depth === 0 && start !== -1) { matches.push(cleaned.slice(start, i + 1)); start = -1; } }
    }
    // Try longest match first
    for (const m of matches.sort((a, b) => b.length - a.length)) {
      try { return JSON.parse(m); } catch {}
    }
    return null;
  };

  const scan = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    let msgIdx = 0;
    setLoadingMessage(loadingMessages[0]);
    msgInterval.current = setInterval(() => {
      msgIdx = (msgIdx + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[msgIdx]);
    }, 3000);

    try {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      let messages = [
        {
          role: "user",
          content: `It is ${today}. Please do ALL the searches listed in your instructions — trending TikTok, trending Twitter, memes, sports, gaming, brand campaigns, current affairs, UAE news, anime/comic con, music/festivals, awareness days, and brand social media activity. Search at least 10 different queries to cover every category thoroughly. After all searches, return the JSON with at least 15 trending items and 5 brand moves. Every category must have entries — especially Memes & Viral Moments, Sports & Gaming, Brand Activations, and Current Affairs. Go.`
        }
      ];

      let result = await callAPI(messages);
      let loops = 0;
      const maxLoops = 15;

      // Keep looping while the model wants to use tools (web_search)
      while (result.stop_reason === "tool_use" && loops < maxLoops) {
        loops++;
        // Build the assistant message (the full content array)
        const assistantContent = result.content;
        messages.push({ role: "assistant", content: assistantContent });

        // Build tool results for each tool_use block
        const toolResults = [];
        for (const block of assistantContent) {
          if (block.type === "web_search") {
            // Web search tool results are automatically handled by the API
            // We just need to acknowledge them
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: "Search completed.",
            });
          }
          if (block.type === "tool_use") {
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: "Search completed.",
            });
          }
        }

        if (toolResults.length > 0) {
          messages.push({ role: "user", content: toolResults });
        } else {
          // Safety: if no tool_use blocks but stop_reason says tool_use, break
          break;
        }

        result = await callAPI(messages);
      }

      // Now extract text from the final response
      const textBlocks = (result.content || [])
        .filter(b => b.type === "text")
        .map(b => b.text);
      const fullText = textBlocks.join("\n");

      if (!fullText.trim()) {
        throw new Error("The API returned no text. This can happen with heavy web searching. Please try again.");
      }

      const parsed = extractJSON(fullText);
      if (!parsed || !parsed.trending) {
        console.log("Raw response text:", fullText.slice(0, 500));
        throw new Error("Could not parse trends data. Hit Rescan to try again.");
      }

      setData(parsed);
    } catch (e) {
      console.error("Scan error:", e);
      setError(e.message || "Something went wrong. Try again.");
    } finally {
      clearInterval(msgInterval.current);
      setLoading(false);
    }
  };

  const filteredTrends = data?.trending?.filter(t => {
    const catMatch = activeFilter === "All" || t.category === activeFilter;
    const platMatch = activePlatform === "All" || (t.platforms || []).includes(activePlatform);
    return catMatch && platMatch;
  }) || [];

  const risingCount = data?.trending?.filter(t => t.velocity === "RISING").length || 0;
  const peakingCount = data?.trending?.filter(t => t.velocity === "PEAKING").length || 0;

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a", color: "#f0f0f0",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      padding: "24px 20px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes sweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#00ff88",
            letterSpacing: 3, marginBottom: 8, fontWeight: 500,
          }}>
            DAILY TRENDS RADAR
          </div>
          <h1 style={{
            fontSize: 28, fontWeight: 700, margin: "0 0 4px 0",
            background: "linear-gradient(135deg, #f0f0f0, #888)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            What's Trending Right Now
          </h1>
          <div style={{ color: "#666", fontSize: 13 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Scan Button */}
        {!data && !loading && (
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <RadarSweep isScanning={false} />
            <div style={{ marginTop: 24 }}>
              <button
                onClick={scan}
                style={{
                  background: "linear-gradient(135deg, #00ff88, #00cc6a)",
                  color: "#000", border: "none", padding: "14px 40px",
                  borderRadius: 30, fontSize: 15, fontWeight: 700,
                  cursor: "pointer", letterSpacing: 0.5,
                  boxShadow: "0 0 30px rgba(0,255,136,0.2)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => e.target.style.boxShadow = "0 0 40px rgba(0,255,136,0.35)"}
                onMouseLeave={e => e.target.style.boxShadow = "0 0 30px rgba(0,255,136,0.2)"}
              >
                🔍 SCAN TODAY'S TRENDS
              </button>
              <p style={{ color: "#555", fontSize: 12, marginTop: 12, maxWidth: 360, margin: "12px auto 0" }}>
                Searches TikTok, Instagram & Twitter/X for trending topics, brand moves, and opportunities
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <RadarSweep isScanning={true} />
            <div style={{
              marginTop: 20, fontFamily: "'DM Mono', monospace", fontSize: 13,
              color: "#00ff88", animation: "pulse 2s ease infinite",
            }}>
              {loadingMessage}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            textAlign: "center", padding: 24, background: "rgba(255,50,50,0.05)",
            border: "1px solid rgba(255,50,50,0.15)", borderRadius: 12, marginBottom: 24,
          }}>
            <p style={{ color: "#ff6b6b", fontSize: 14, margin: "0 0 12px 0" }}>{error}</p>
            <button onClick={scan} style={{
              background: "rgba(255,255,255,0.06)", color: "#f0f0f0", border: "1px solid rgba(255,255,255,0.1)",
              padding: "8px 24px", borderRadius: 20, fontSize: 13, cursor: "pointer",
            }}>
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {data && (
          <>
            {/* Stats Bar */}
            <div style={{
              display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap",
              justifyContent: "center",
            }}>
              {[
                { label: "TRENDS FOUND", value: data.trending?.length || 0, color: "#f0f0f0" },
                { label: "RISING", value: risingCount, color: "#00ff88" },
                { label: "PEAKING", value: peakingCount, color: "#ff6b35" },
                { label: "BRAND MOVES", value: data.brandMoves?.length || 0, color: "#1da1f2" },
              ].map(s => (
                <div key={s.label} style={{
                  padding: "12px 20px", background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, textAlign: "center",
                  flex: "1 1 80px", minWidth: 80,
                }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: "#666", letterSpacing: 1.5, fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Today Is */}
            {data.todayIs && data.todayIs.length > 0 && (
              <div style={{
                padding: 16, background: "rgba(255,107,53,0.04)",
                border: "1px solid rgba(255,107,53,0.1)", borderRadius: 12, marginBottom: 24,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#ff6b35", letterSpacing: 1.5, marginBottom: 8 }}>
                  📅 TODAY IS
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {data.todayIs.map((d, i) => (
                    <span key={i} style={{
                      padding: "4px 12px", borderRadius: 20, fontSize: 12,
                      color: "#f0f0f0", background: "rgba(255,107,53,0.08)",
                      border: "1px solid rgba(255,107,53,0.15)",
                    }}>{d}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Events */}
            {data.upcomingEvents && data.upcomingEvents.length > 0 && (
              <div style={{
                padding: 16, background: "rgba(29,161,242,0.04)",
                border: "1px solid rgba(29,161,242,0.1)", borderRadius: 12, marginBottom: 24,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#1da1f2", letterSpacing: 1.5, marginBottom: 8 }}>
                  📆 COMING UP THIS WEEK
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {data.upcomingEvents.map((e, i) => (
                    <span key={i} style={{
                      padding: "4px 12px", borderRadius: 20, fontSize: 12,
                      color: "#f0f0f0", background: "rgba(29,161,242,0.08)",
                      border: "1px solid rgba(29,161,242,0.15)",
                    }}>{e}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: "flex", gap: 2, marginBottom: 20, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 3 }}>
              {[
                { id: "trends", label: `Trends (${data.trending?.length || 0})` },
                { id: "brands", label: `Brand Moves (${data.brandMoves?.length || 0})` },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  flex: 1, padding: "10px 16px", borderRadius: 8, border: "none",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  background: activeTab === tab.id ? "rgba(255,255,255,0.08)" : "transparent",
                  color: activeTab === tab.id ? "#f0f0f0" : "#666",
                }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Trends Tab */}
            {activeTab === "trends" && (
              <>
                {/* Filters */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: "#555", letterSpacing: 1.5, fontWeight: 600, marginBottom: 8 }}>PLATFORM</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                    {["All", ...PLATFORMS].map(p => (
                      <button key={p} onClick={() => setActivePlatform(p)} style={{
                        padding: "5px 14px", borderRadius: 20, border: "1px solid",
                        fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
                        background: activePlatform === p ? "rgba(0,255,136,0.1)" : "transparent",
                        color: activePlatform === p ? "#00ff88" : "#666",
                        borderColor: activePlatform === p ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.08)",
                      }}>
                        {p}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: "#555", letterSpacing: 1.5, fontWeight: 600, marginBottom: 8 }}>CATEGORY</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["All", ...CATEGORIES].map(c => {
                      const count = c === "All" ? (data?.trending?.length || 0) : (data?.trending?.filter(t => t.category === c).length || 0);
                      return (
                        <button key={c} onClick={() => setActiveFilter(c)} style={{
                          padding: "5px 14px", borderRadius: 20, border: "1px solid",
                          fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
                          background: activeFilter === c ? "rgba(0,255,136,0.1)" : "transparent",
                          color: activeFilter === c ? "#00ff88" : count === 0 ? "#333" : "#666",
                          borderColor: activeFilter === c ? "rgba(0,255,136,0.3)" : count === 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)",
                        }}>
                          {c} {count > 0 && <span style={{ fontSize: 10, opacity: 0.7 }}>({count})</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Trend Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filteredTrends.length > 0 ? filteredTrends.map((t, i) => (
                    <TrendCard key={i} trend={t} index={i} />
                  )) : (
                    <div style={{ textAlign: "center", padding: 40, color: "#555", fontSize: 14 }}>
                      No trends match this filter. Try broadening your selection.
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Brand Moves Tab */}
            {activeTab === "brands" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(data.brandMoves || []).map((m, i) => (
                  <BrandMoveCard key={i} move={m} index={i} />
                ))}
              </div>
            )}

            {/* Rescan */}
            <div style={{ textAlign: "center", marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button onClick={scan} style={{
                background: "rgba(255,255,255,0.04)", color: "#888", border: "1px solid rgba(255,255,255,0.08)",
                padding: "10px 28px", borderRadius: 24, fontSize: 13, cursor: "pointer",
                fontWeight: 600, transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.target.style.color = "#00ff88"; e.target.style.borderColor = "rgba(0,255,136,0.3)"; }}
              onMouseLeave={e => { e.target.style.color = "#888"; e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                🔄 RESCAN
              </button>
              <p style={{ color: "#444", fontSize: 11, marginTop: 8 }}>
                Last scanned: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </>
        )}

        {/* Footer with instructions */}
        <div style={{
          marginTop: 40, padding: 20, background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.04)", borderRadius: 12,
          fontSize: 12, color: "#555", lineHeight: 1.7,
        }}>
          <div style={{ fontWeight: 700, color: "#888", marginBottom: 8, fontSize: 11, letterSpacing: 1 }}>
            HOW TO USE THIS DAILY
          </div>
          <div>
            Come back to this chat each morning and hit "Rescan" for fresh trends.
            Click any trend card to see the opportunity and which of your brands should jump on it.
            Filter by platform or category to focus on what matters.
            Rising = catch it NOW. Peaking = you might still make it. Fading = too late.
          </div>
        </div>
      </div>
    </div>
  );
}
