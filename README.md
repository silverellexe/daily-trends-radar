# 🔍 Daily Trends Radar

A real-time social media trends dashboard that scans TikTok, Instagram, and Twitter/X for what's trending right now — built for brand managers and social media teams who need to catch trends before they peak.

## What It Does

- **Scans trending topics** across TikTok, Instagram, and Twitter/X in real time
- **Categorizes trends** into: Pop Culture & Anime, Music & Festivals, Memes & Viral Moments, Awareness Days, Brand Activations, Sports & Gaming, Current Affairs, UAE & MENA
- **Tracks velocity** — RISING (jump on it NOW), PEAKING (might still make it), FADING (too late)
- **Shows brand moves** — what brands like Duolingo, Ryanair, KFC, Wendy's are doing on social
- **Maps opportunities** to your tracked brands with actionable content ideas
- **Lists awareness days** and upcoming events for the week

## Tracked Brands

KFC, TheLittleThings (UAE), Comic Cave, Comic Con, Duolingo, Ryanair, KitKat, Wendy's, Chipotle, Netflix, Scrub Daddy, Liquid Death

## How To Use

### Option 1: Run in Claude.ai (Easiest)
1. Go to [claude.ai](https://claude.ai)
2. Start a new conversation
3. Upload the `daily-trends-radar.jsx` file
4. Ask Claude to "run this artifact"
5. Hit **SCAN TODAY'S TRENDS**
6. Come back daily and rescan

### Option 2: Run locally
This is a React component that uses the Anthropic API with web search. You'll need:
- An Anthropic API key
- A React environment (Vite, Next.js, Create React App, etc.)

```bash
npm create vite@latest trends-radar -- --template react
cd trends-radar
# Copy daily-trends-radar.jsx into src/
# Update App.jsx to import and render the component
npm run dev
```

> **Note:** When running locally, you'll need to add your API key to the fetch headers. The component is designed to run inside Claude.ai's artifact system where API auth is handled automatically.

## How It Works

The dashboard calls the Anthropic API with web search enabled. It instructs Claude to perform 10+ targeted web searches across different categories (trending TikTok, trending memes, sports news, brand campaigns, etc.) and compile results into a structured JSON response. The multi-turn conversation loop handles the back-and-forth of web search tool calls automatically.

## Customization

To track different brands, edit the `BRANDS` array and update the brand list in `systemPrompt` at the top of the file.

To add/remove categories, edit the `CATEGORIES` array.

## License

MIT — use it however you want.
