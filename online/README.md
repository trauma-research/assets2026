# Common Ground online (multiplayer)

Each device joins one shared table. A Cloudflare Durable Object (`src/index.js`) keeps the game and decides what each device can see. A player's hand is only sent to that player, until the table reveals.

## Files
- `src/index.js`: the game server (rooms, phases, hidden hands, voting, skipping, reconnecting).
- `src/data.json`: the card content, copied from `common_ground.html`. Regenerate it when the cards change.
- `wrangler.toml`: the Worker settings. `ALLOWED_ORIGINS` lists the pages allowed to connect.
- `../online.html`: the page used by the host and by players.

## Deploy
1. From this folder, run `npx wrangler deploy`. Wrangler prints the Worker URL, for example `https://common-ground-online.<subdomain>.workers.dev`.
2. In `online.html`, set `ONLINE_API` to that URL, then commit and push. Until this is set, the page shows that online play is not set up.

## Test locally
1. From this folder, run `npx wrangler dev --port 8787`.
2. Serve the repo (for example `python3 -m http.server 8768`) and open `http://127.0.0.1:8768/online.html?api=http://localhost:8787`.

## Rules in this version
- The host runs the table and does not hold a hand. Players can join while the lobby is open; the table needs at least 2 players and holds up to 6.
- Each player locks one complication or passes. Players may add their own complication to their hand.
- The host can skip a player at any time during a round, and bring them back during the lock-in stage.
- Each player with a card on the table votes for one card other than their own. The host counts the votes. If the vote is tied, or nobody voted, the host picks the card.
- The host writes the mitigation and the library entries are saved on the host's device (to the chosen folder, or downloaded).
- In testimony rounds, each player writes one reflection. The host sees the reflections as they arrive and files them when the host finishes the round.

## Limits
- Anyone with the table code can join while the lobby is open. The code is short, so treat it as a shared secret for the session.
- The host's link contains the host token. Keep it private; it is needed to run the table from another device.
- The host sees reflections while they are written. Players cannot see each other's reflections until the host finishes the round.
- A player who disconnects keeps their seat and can rejoin with the same device. The game waits for them unless the host skips them.
