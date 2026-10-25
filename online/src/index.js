// Common Ground online: one Durable Object per room holds the game and decides what each device may see.
// Players' hands are sent only to that player, and only during the lock-in stage.

import data from "./data.json";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 6;
const MAX_NAME = 30;
const MAX_TEXT = 1000;
const MAX_COMPLICATION = 300;
const ROOM_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomHex(bytes) {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomCode() {
  const a = new Uint8Array(6);
  crypto.getRandomValues(a);
  return [...a].map((b) => ROOM_CHARS[b % ROOM_CHARS.length]).join("");
}

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function corsHeaders(origin, env) {
  const allowed = allowedOrigins(env).includes(origin) ? origin : "null";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function allowedOrigins(env) {
  return (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin, env);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });

    if (url.pathname === "/api/rooms" && request.method === "POST") {
      if (!allowedOrigins(env).includes(origin)) return json({ error: "Origin not allowed." }, 403, headers);
      const code = randomCode();
      const hostToken = randomHex(24);
      const stub = env.ROOMS.get(env.ROOMS.idFromName(code));
      const res = await stub.fetch("https://room/init", { method: "POST", body: JSON.stringify({ code, hostToken }) });
      if (!res.ok) return json({ error: "Could not create the room." }, 502, headers);
      return json({ code, hostToken }, 201, headers);
    }

    const match = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]{6})\/ws$/);
    if (match && request.headers.get("Upgrade") === "websocket") {
      if (!allowedOrigins(env).includes(origin)) return new Response("Origin not allowed.", { status: 403 });
      return env.ROOMS.get(env.ROOMS.idFromName(match[1])).fetch(request);
    }

    return json({ error: "Not found." }, 404, headers);
  },
};

function newRoom(code, hostToken) {
  return {
    code,
    hostToken,
    phase: "lobby",
    round: 0,
    kind: null,
    players: [],
    dealerIndex: 0,
    dilemmaDeck: shuffle(data.dilemmas.map((d) => d.id)),
    testimonyDeck: shuffle(data.testimonies.map((t) => t.id)),
    dilemmaId: null,
    testimonyId: null,
    hands: {},
    ugc: [],
    reflections: {},
    tieCandidates: [],
    tallyCounts: null,
    winnerId: null,
    lastMitigation: null,
  };
}

export class GameRoom {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.room = null;
  }

  async load() {
    if (!this.room) this.room = (await this.ctx.storage.get("room")) ?? null;
    return this.room;
  }

  async save() {
    await this.ctx.storage.put("room", this.room);
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/init") {
      const { code, hostToken } = await request.json();
      if (await this.load()) return new Response("Room exists.", { status: 409 });
      this.room = newRoom(code, hostToken);
      await this.save();
      return new Response("ok");
    }
    if (request.headers.get("Upgrade") !== "websocket") return new Response("Expected a WebSocket.", { status: 426 });
    if (!(await this.load())) return new Response("No such room.", { status: 404 });

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    this.ctx.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  send(ws, message) {
    ws.send(JSON.stringify(message));
  }

  async webSocketMessage(ws, raw) {
    await this.load();
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return this.send(ws, { type: "error", message: "Invalid message." });
    }
    if (msg.type === "hello") return this.hello(ws, msg);

    const who = ws.deserializeAttachment();
    if (!who) return this.send(ws, { type: "error", message: "Say hello first." });

    const problem = this.act(who, msg);
    if (problem) return this.send(ws, { type: "error", message: problem });
    await this.save();
    this.broadcast();
  }

  async webSocketClose(ws) {
    await this.load();
    this.broadcast(ws);
  }

  async webSocketError(ws) {
    await this.load();
    this.broadcast(ws);
  }

  async hello(ws, msg) {
    const r = this.room;
    if (msg.token && msg.token === r.hostToken) {
      ws.serializeAttachment({ role: "host" });
      return this.broadcast();
    }
    const existing = msg.token && r.players.find((p) => p.token === msg.token);
    if (existing) {
      ws.serializeAttachment({ role: "player", playerId: existing.id });
      return this.broadcast();
    }
    // New player: only while the lobby is open.
    const name = typeof msg.name === "string" ? msg.name.trim() : "";
    if (r.phase !== "lobby") return this.send(ws, { type: "error", message: "This game has already started." });
    if (!name || name.length > MAX_NAME) return this.send(ws, { type: "error", message: `Enter a name (up to ${MAX_NAME} characters).` });
    if (r.players.length >= MAX_PLAYERS) return this.send(ws, { type: "error", message: "This room is full." });

    const player = { id: randomHex(6), name, token: randomHex(24), points: 0, passed: false, skipped: false, locked: null, voted: null };
    r.players.push(player);
    ws.serializeAttachment({ role: "player", playerId: player.id });
    await this.save();
    this.send(ws, { type: "welcome", token: player.token });
    this.broadcast();
  }

  // `closing` is a socket that is shutting down; it is not counted as online.
  broadcast(closing = null) {
    const sockets = this.ctx.getWebSockets().filter((s) => s !== closing);
    const online = new Set(sockets.map((s) => s.deserializeAttachment()?.playerId).filter(Boolean));
    for (const ws of sockets) {
      const who = ws.deserializeAttachment();
      if (!who) continue;
      this.send(ws, { type: "state", view: viewFor(this.room, who, online) });
    }
  }

  // Returns an error message, or null when the action was applied.
  act(who, msg) {
    const r = this.room;
    const me = who.role === "player" ? r.players.find((p) => p.id === who.playerId) : null;
    const isHost = who.role === "host";

    switch (msg.type) {
      case "start":
        if (!isHost) return "Only the host can start the game.";
        if (r.phase !== "lobby") return "The game has already started.";
        if (r.players.length < MIN_PLAYERS) return `At least ${MIN_PLAYERS} players are needed.`;
        return startRound(r);

      case "nextRound":
        if (!isHost) return "Only the host can start the next round.";
        if (r.phase !== "between") return "The round is not finished yet.";
        return startRound(r);

      case "skip": {
        if (!isHost) return "Only the host can skip a player.";
        const target = r.players.find((p) => p.id === msg.playerId);
        if (!target) return "No such player.";
        if (!["lock", "reveal", "testimony"].includes(r.phase)) return "Players can only be skipped during a round.";
        if (r.phase === "lock" && target.locked) return "That player has already locked a card.";
        target.skipped = true;
        if (r.phase === "lock") afterLock(r);
        return null;
      }

      case "unskip": {
        if (!isHost) return "Only the host can do this.";
        const target = r.players.find((p) => p.id === msg.playerId);
        if (!target) return "No such player.";
        if (!["lock", "ready", "reveal", "testimony"].includes(r.phase)) return "Nothing to undo right now.";
        target.skipped = false;
        if (r.phase === "ready") r.phase = "lock";
        return null;
      }

      case "reveal":
        if (!isHost) return "Only the host can reveal the cards.";
        if (r.phase !== "ready") return "The cards are not ready to reveal.";
        r.phase = "reveal";
        return null;

      case "skipRound":
        if (!isHost) return "Only the host can end the round.";
        if (r.phase !== "ready") return "Nothing to end yet.";
        if (r.players.some((p) => p.locked)) return "Cards are locked. Reveal them instead.";
        nextDealer(r);
        r.phase = "between";
        return null;

      case "tally":
        if (!isHost) return "Only the host can count the votes.";
        if (r.phase !== "reveal") return "The votes are not open.";
        return tally(r);

      case "tie":
        if (!isHost) return "Only the host can choose the winning card.";
        if (r.phase !== "tie") return "There is no tie to resolve.";
        if (!r.tieCandidates.includes(msg.playerId)) return "That card is not one of the tied cards.";
        finalise(r, msg.playerId);
        return null;

      case "mitigation": {
        if (!isHost) return "Only the host can save the mitigation.";
        if (r.phase !== "mitigation") return "No mitigation is due.";
        const text = typeof msg.text === "string" ? msg.text.trim() : "";
        if (!text || text.length > MAX_TEXT) return `Write a mitigation (up to ${MAX_TEXT} characters).`;
        const principles = Array.isArray(msg.principles) ? [...new Set(msg.principles)] : [];
        if (!principles.length || !principles.every(validPrinciple)) return "Choose at least one principle.";
        r.lastMitigation = { text, principles };
        nextDealer(r);
        r.phase = "between";
        return null;
      }

      case "finishTestimony":
        if (!isHost) return "Only the host can finish the testimony round.";
        if (r.phase !== "testimony") return "This is not a testimony round.";
        nextDealer(r);
        r.phase = "between";
        return null;

      case "lock": {
        if (!me) return "Only players can lock a card.";
        if (r.phase !== "lock") return "Cards can only be locked during the lock-in stage.";
        if (me.locked) return "You have already locked a card.";
        if (me.passed || me.skipped) return "You are out of this round.";
        const card = (r.hands[me.id] || []).find((c) => c.id === msg.cardId);
        if (!card) return "That card is not in your hand.";
        me.locked = { id: card.id, text: card.text, ownerId: me.id };
        afterLock(r);
        return null;
      }

      case "pass":
        if (!me) return "Only players can pass.";
        if (r.phase !== "lock") return "You can only pass during the lock-in stage.";
        if (me.locked) return "You have already locked a card.";
        me.passed = true;
        afterLock(r);
        return null;

      case "rejoin":
        if (!me) return "Only players can rejoin.";
        if (r.phase !== "lock") return "You can only rejoin during the lock-in stage.";
        if (!me.passed) return "You have not passed.";
        me.passed = false;
        return null;

      case "addComplication": {
        if (!me) return "Only players can add a complication.";
        if (r.phase !== "lock" || r.dilemmaId === null) return "Complications can only be added during the lock-in stage.";
        const text = typeof msg.text === "string" ? msg.text.trim() : "";
        if (!text || text.length > MAX_COMPLICATION) return `Write a complication (up to ${MAX_COMPLICATION} characters).`;
        const item = { id: `ugc-${Date.now()}-${randomHex(3)}`, text, dilemmaId: r.dilemmaId, ugc: true };
        r.ugc.push(item);
        (r.hands[me.id] ||= []).push(item);
        return null;
      }

      case "vote": {
        if (!me) return "Only players can vote.";
        if (r.phase !== "reveal") return "Voting is not open.";
        if (!me.locked) return "Only players with a card on the table can vote.";
        if (me.skipped) return "You have been skipped for this vote.";
        const owner = r.players.find((p) => p.id === msg.ownerId);
        if (!owner || !owner.locked) return "That card is not on the table.";
        if (owner.id === me.id) return "You cannot vote for your own card.";
        me.voted = owner.id;
        return null;
      }

      case "reflect": {
        if (!me) return "Only players can write a reflection.";
        if (r.phase !== "testimony") return "Reflections are only written in testimony rounds.";
        if (me.skipped) return "You have been skipped for this round.";
        const text = typeof msg.text === "string" ? msg.text.trim() : "";
        if (!text || text.length > MAX_TEXT) return `Write a reflection (up to ${MAX_TEXT} characters).`;
        if (!validPrinciple(msg.principle)) return "Choose a principle.";
        r.reflections[me.id] = { text, principle: msg.principle };
        return null;
      }

      default:
        return "Unknown action.";
    }
  }
}

function validPrinciple(p) {
  return Number.isInteger(p) && p >= 0 && p < data.principles.length;
}

function nextDealer(r) {
  r.dealerIndex = (r.dealerIndex + 1) % r.players.length;
}

function startRound(r) {
  if (r.dilemmaDeck.length === 0) {
    r.phase = "finished";
    return null;
  }
  r.round += 1;
  r.kind = r.round % 4 === 0 && r.testimonyDeck.length > 0 ? "testimony" : "dilemma";
  r.tieCandidates = [];
  r.tallyCounts = null;
  r.winnerId = null;
  r.reflections = {};
  r.hands = {};
  r.players.forEach((p) => {
    p.passed = false;
    p.skipped = false;
    p.locked = null;
    p.voted = null;
  });

  if (r.kind === "testimony") {
    r.testimonyId = r.testimonyDeck.shift();
    r.dilemmaId = null;
    r.phase = "testimony";
    return null;
  }

  const id = r.dilemmaDeck.shift();
  const dilemma = data.dilemmas.find((d) => d.id === id);
  r.dilemmaId = id;
  r.testimonyId = null;
  const pool = dilemma.complications.map((text, i) => ({ id: `d${id}-c${i + 1}`, text, ugc: false, dilemmaId: id }));
  const ugc = r.ugc.filter((c) => c.dilemmaId === id);
  const handSize = r.players.length >= 5 ? 2 : 3;
  r.players.forEach((p) => {
    r.hands[p.id] = shuffle([...pool, ...ugc]).slice(0, handSize);
  });
  r.phase = "lock";
  return null;
}

// Once nobody is still deciding, the table can reveal.
function afterLock(r) {
  if (r.phase !== "lock") return;
  const stillDeciding = r.players.some((p) => !p.passed && !p.skipped && !p.locked);
  if (!stillDeciding) r.phase = "ready";
}

function tally(r) {
  const counts = {};
  r.players.forEach((p) => {
    if (p.locked) counts[p.id] = 0;
  });
  r.players.forEach((v) => {
    if (v.voted && counts[v.voted] !== undefined) counts[v.voted] += 1;
  });
  const candidates = Object.keys(counts);
  if (!candidates.length) return "No cards are on the table.";
  r.tallyCounts = counts;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) {
    r.tieCandidates = candidates;
    r.phase = "tie";
    return null;
  }
  const max = Math.max(...Object.values(counts));
  const winners = candidates.filter((id) => counts[id] === max);
  if (winners.length === 1) finalise(r, winners[0]);
  else {
    r.tieCandidates = winners;
    r.phase = "tie";
  }
  return null;
}

function finalise(r, playerId) {
  const winner = r.players.find((p) => p.id === playerId);
  winner.points += 1;
  r.winnerId = playerId;
  r.phase = "mitigation";
}

function viewFor(r, who, online) {
  const me = who.role === "player" ? r.players.find((p) => p.id === who.playerId) : null;
  const isHost = who.role === "host";
  const dilemma = r.dilemmaId !== null ? data.dilemmas.find((d) => d.id === r.dilemmaId) : null;
  const testimony = r.testimonyId !== null ? data.testimonies.find((t) => t.id === r.testimonyId) : null;
  const revealed = ["reveal", "tie", "mitigation", "between"].includes(r.phase);
  const counted = ["tie", "mitigation", "between"].includes(r.phase);
  const nameOf = (id) => r.players.find((p) => p.id === id)?.name ?? "";

  return {
    you: isHost ? { role: "host" } : me ? { role: "player", playerId: me.id, name: me.name } : null,
    code: r.code,
    phase: r.phase,
    round: r.round,
    kind: r.kind,
    deckLeft: r.dilemmaDeck.length,
    canStart: isHost && r.phase === "lobby" && r.players.length >= MIN_PLAYERS,
    dealerId: r.players[r.dealerIndex]?.id ?? null,
    principles: data.principles.map((p) => ({ id: p.id, name: p.name, question: p.question })),
    players: r.players.map((p, i) => ({
      id: p.id,
      name: p.name,
      points: p.points,
      connected: online.has(p.id),
      passed: p.passed,
      skipped: p.skipped,
      hasLocked: !!p.locked,
      hasVoted: !!p.voted,
      hasReflected: !!r.reflections[p.id],
      isDealer: i === r.dealerIndex,
    })),
    dilemma: dilemma
      ? { title: dilemma.title, category: dilemma.category, phase: dilemma.phase, description: dilemma.description, prompts: dilemma.prompts }
      : null,
    testimony: testimony ? { title: testimony.title, account: testimony.account, prompts: testimony.prompts } : null,
    hand:
      me && r.phase === "lock" && !me.locked && !me.passed && !me.skipped
        ? (r.hands[me.id] || []).map((c) => ({ id: c.id, text: c.text, ugc: !!c.ugc }))
        : [],
    myLocked: me?.locked ? { id: me.locked.id, text: me.locked.text } : null,
    myVote: me?.voted ?? null,
    myReflection: me && r.reflections[me.id] ? r.reflections[me.id] : null,
    revealed: revealed && r.kind === "dilemma"
      ? r.players.filter((p) => p.locked).map((p) => ({ ownerId: p.id, ownerName: p.name, text: p.locked.text }))
      : [],
    tieCandidates: r.phase === "tie"
      ? r.tieCandidates.map((id) => ({ id, name: nameOf(id), text: r.players.find((p) => p.id === id)?.locked?.text ?? "" }))
      : [],
    tally: counted ? r.tallyCounts : null,
    winnerId: r.winnerId,
    winnerName: r.winnerId ? nameOf(r.winnerId) : null,
    // The host sees reflections as they arrive so the facilitator can file them.
    reflections: isHost && r.phase === "testimony"
      ? Object.entries(r.reflections).map(([id, v]) => ({ playerName: nameOf(id), text: v.text, principle: v.principle }))
      : null,
    lastMitigation: isHost ? r.lastMitigation : null,
  };
}
