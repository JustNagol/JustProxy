import express from "express";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, "public")));

// ── UPSTASH REDIS HELPERS ──
const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const ADMIN_PASS  = process.env.ADMIN_PASSWORD || "changeme";

async function redisCmd(...args) {
  const res = await fetch(`${REDIS_URL}/${args.map(encodeURIComponent).join("/")}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
  });
  const data = await res.json();
  return data.result;
}

async function getPending() {
  const ids = await redisCmd("lrange", "pending", "0", "-1");
  if (!ids || !ids.length) return [];
  const games = await Promise.all(ids.map(id => redisCmd("get", `game:${id}`)));
  return games.filter(Boolean).map(g => JSON.parse(g));
}

async function getApproved() {
  const ids = await redisCmd("lrange", "approved", "0", "-1");
  if (!ids || !ids.length) return [];
  const games = await Promise.all(ids.map(id => redisCmd("get", `game:${id}`)));
  return games.filter(Boolean).map(g => JSON.parse(g));
}

// ── PUBLIC ROUTES ──

// Short routes
app.get("/g", (_req, res) => res.sendFile(join(__dirname, "public/games.html")));
app.get("/m", (_req, res) => res.sendFile(join(__dirname, "public/media.html")));
app.get("/s", (_req, res) => res.sendFile(join(__dirname, "public/settings.html")));
app.get("/admin", (_req, res) => res.sendFile(join(__dirname, "public/admin.html")));

// Games list — merges static games-list.json + approved community games
app.get("/api/games", async (_req, res) => {
  try {
    const { createRequire } = await import("module");
    const require = createRequire(import.meta.url);
    let base = [];
    try { base = require("./public/games/games-list.json"); } catch {}
    const approved = await getApproved();
    res.json([...base, ...approved]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Submit a game for review
app.post("/api/submit", async (req, res) => {
  try {
    const { title, url, thumbnail } = req.body;
    if (!title || !url) return res.status(400).json({ error: "title and url required" });
    const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
    const game = { id, title, url, thumbnail: thumbnail || null, submittedAt: new Date().toISOString() };
    await redisCmd("set", `game:${id}`, JSON.stringify(game));
    await redisCmd("rpush", "pending", id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── ADMIN ROUTES (password protected) ──
function auth(req, res, next) {
  const pass = req.headers["x-admin-password"];
  if (pass !== ADMIN_PASS) return res.status(401).json({ error: "unauthorized" });
  next();
}

// Get pending submissions
app.get("/api/admin/pending", auth, async (_req, res) => {
  try { res.json(await getPending()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Approve a submission
app.post("/api/admin/approve/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const raw = await redisCmd("get", `game:${id}`);
    if (!raw) return res.status(404).json({ error: "not found" });
    await redisCmd("lrem", "pending", "0", id);
    await redisCmd("rpush", "approved", id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Deny a submission
app.post("/api/admin/deny/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    await redisCmd("lrem", "pending", "0", id);
    await redisCmd("del", `game:${id}`);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.use("*", (_req, res) => {
  res.sendFile(join(__dirname, "public/index.html"));
});

export default app;