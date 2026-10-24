# Common Ground: build plan

A single-page, offline card game for a small group (2 to 6 people) that works through the ways trauma-informed accessibility research can go wrong, and agrees how to put each one right. It is played around one shared device, with cards kept hidden from other players until a reveal.

This document describes behaviour, data, rules and requirements. It does not describe the visual design, which is for you to develop.

---

## 1. Purpose

- Help a group surface harms in trauma-informed research: the consent, safety, power and cultural failures that happen in practice.
- For each dilemma, have players find the complication that does the most damage, then agree a mitigation.
- File every agreed mitigation under one or more of six good-practice principles, so a session produces a usable set of best practices.
- Produce a written record of the session that can be copied or saved.

Tone matters. The game deals with harm and sometimes with a participant's own experience. Copy must be plain and calm. Never make light of harm, and never imply that a participant is to blame.

---

## 2. Glossary

- **Dilemma**: a research scenario (for example, "The lone visit"). Each has a category, a title, a short description, a lifecycle phase, and three prompts for a stalled round.
- **Category**: one of six principles. Every dilemma belongs to exactly one category.
- **Complication**: a single sentence that could make a dilemma worse. Each dilemma has its own 20 complications.
- **Hand**: the complications a player holds for the current dilemma.
- **Lock**: a player's chosen complication for the round.
- **Turn**: the player currently allowed to see their own hand.
- **Mitigation**: a sentence the whole table agrees that would have stopped or reduced the harm.
- **Principle**: one of seven filing labels (the six categories plus "None of these fit").
- **UGC complication**: a complication a player writes themselves during play. It is marked for later moderation.
- **Testimony card**: a first-person account read aloud, which replaces a dilemma on certain rounds.

---

## 3. Content

### 3.1 Principles (also the six categories)

Use these names and guiding questions exactly.

1. **Safety** — Does this person feel safe in this room, in this format, with you, and do you?
2. **Trustworthiness and transparency** — Does the participant know what happens to what they say, who hears it, and what you cannot promise?
3. **Peer support** — Is anyone here because they have been through it, and are they paid, supported and credited?
4. **Collaboration and mutuality** — Who set the question, who controls the pace, and who decides when it stops?
5. **Empowerment, voice and choice** — Is the choice on offer a real one, or a choice between taking part as designed and not at all?
6. **Cultural, historical and gender issues** — Whose norms shaped this method, and what history does this community have with people like you?
7. **None of these fit** — So what does it serve? A principle set that cannot name your fix is a finding about the set. (Not a category; available only as a filing label.)

Each category must have a distinct colour. Choose colours that stay distinguishable for colour-blind players. The category name must always appear next to the colour, so colour is never the only cue.

### 3.2 Dilemmas

- Total: **30**, five per category.
- Each dilemma has:
  - `title` (short, for example "The lone visit")
  - `category` (1 to 6)
  - `description` (one or two sentences, written as a scene)
  - `phase` (one of: Recruitment, Consent, Data collection, Analysis, Dissemination, Aftercare)
  - `icon` (optional key, for decoration only)
  - `prompts` (exactly three questions that help a stalled table)
- The full text for all 30 is in `content.md`, section 2. Copy it into a content file, for example `content/dilemmas.json`. Keep the text unchanged unless the user asks otherwise.

### 3.3 Complications

- Each dilemma has **exactly 20** complications, one sentence each, written for that dilemma (600 in total).
- Complications must relate to the dilemma they belong to. A complication from one dilemma must never be dealt for another.
- The full set is in `content.md`, section 2, listed under each dilemma. Copy it into `content/complications.json`, keyed by dilemma.

### 3.4 Testimony cards

- Total: **4**. Each has a title, a first-person account, and three prompts.
- Source: `content.md`, section 3. Copy it into `content/testimony.json`.

---

## 4. Setup

1. Choose the number of players: 2, 3, 4, 5 or 6.
2. Optionally enter names, separated by commas. Missing names default to "Player N".
3. Start the game. The deck is shuffled: the 30 dilemmas, and the 4 testimony cards.
4. A new game clears any saved game (see section 12).

Player 1 deals first. The dealer changes after each completed round.

---

## 5. Round structure

Rounds are numbered from 1. A round is one of two kinds.

- **Dilemma round** (most rounds): a dilemma is played.
- **Testimony round**: every fourth round (round 4, 8, 12, and so on) reads a testimony card instead, while testimony cards remain. In a testimony round nobody plays a complication.

Each dilemma appears at most once per game. The game ends when the dilemma deck is empty.

### 5.1 Dealing a dilemma round

1. Take the next dilemma from the deck and show it.
2. For each player, deal a hand drawn from that dilemma's own 20 complications:
   - 2 cards for 5 or 6 players
   - 3 cards for 2 to 4 players
3. No card appears twice in one player's hand. The same card may appear in two players' hands.
4. Set the turn to the dealer.

### 5.2 Hidden play (one player at a time)

Nobody can see another player's hand. Players take turns.

1. The player whose turn it is presses **Show my cards**. Only their hand is visible. Everyone else's cards are shown face down.
2. The player chooses one complication from their hand and locks it.
3. As soon as the player locks their card, their cards hide again. The game announces **"Handover to [next player]"**, where the next player is the next player in turn order who has not yet locked and has not passed.
4. Turn order runs clockwise from the dealer and wraps around.
5. A player who has locked can no longer change their card.
6. While their cards are showing, a player may press **Hide my cards** to hide them again without locking. This does not count as a handover.
7. A player may **Pass** at any time before locking. A passed player takes no part in the round. If a passed player holds the turn, the turn moves on.
8. A player who passed may re-join. If the turn has already gone past everyone, re-joining gives them the turn.
9. Each player's face-down cards should show a clear status: "Waiting for handover" when it is not their turn, "Locked in" once they have locked, and a "Show my cards" control only for the player whose turn it is.

When every player has locked or passed, the table is ready to reveal. The status should read "Everyone has locked in. Reveal together."

### 5.3 Writing your own complication (UGC)

- While their cards are showing, a player may write a single complication of their own.
- It is added to that player's hand immediately, and it can be locked this round.
- It is also saved to the library, under the current dilemma, with a UGC mark and the note "This will be checked by a moderator."
- UGC complications are dealt like any other complication for that dilemma the next time it is played. Only the marking is special, so that it can be checked later.
- Players may add only while their cards are showing.

### 5.4 Revealing and voting

1. **Reveal together** is available only once every player has locked or passed. Pressing it reveals every locked card to the whole table.
2. For each locked card, each player says one sentence: how this card makes the dilemma worse, and for whom.
3. Voting: each player adds votes to the cards they think do the most damage.
   - A player **must not vote for their own card**. The UI must block it. (The current prototype does not enforce this; it must be enforced in the new build.)
   - Votes can be added and removed until the vote is confirmed.
4. Confirm the vote:
   - If one card has the most votes, that player scores one point (see section 6).
   - If two or more cards are tied for most votes, the table is in a **tie**. The dealer taps the winning card. That player scores one point.
   - At least one vote must be cast before the vote can be confirmed.
5. Once the vote is decided, show the stall prompts for the dilemma (the three prompts from section 3.2), for any table that needs them.

### 5.5 Mitigation

1. The table agrees **one sentence** that would have stopped or reduced the harm. Typing is by one person, on behalf of the table.
2. Tick **one or more** principles that the mitigation serves. At least one must be ticked to save. Use all seven labels (see section 3.1).
3. Saving files the mitigation under **every** ticked principle, with the dilemma's title and the winning player's name attached.
4. The round then ends. Locks and passes are cleared, the dealer moves to the next player, and the next round begins.

### 5.6 Testimony round

1. The dealer reads the testimony card aloud, in full.
2. Nobody plays a complication. Each player writes one thing that should have happened, in their own words.
3. Each written line is filed under one principle (one choice per line).
4. Save the testimony round. The dealer moves on, and the next round begins.

### 5.7 Swapping the dilemma

Before the reveal, the table can **swap** the current dilemma for another dilemma that has not been played yet.

1. The dilemma on the table goes back into the deck.
2. A new dilemma is drawn at random from the unplayed dilemmas.
3. Every hand is re-dealt for the new dilemma. All locks are cleared. Passes stay in place.
4. Swapping is not allowed once the cards have been revealed.

---

## 6. Scoring

- The only scoring is the **worst-card point**: one point for the player whose card wins the vote in a dilemma round.
- Each player's total is shown on their seat.
- A **score panel** shows all players ranked by points, most first.
  - Ties share a rank. For example, two players on zero are both 2nd.
  - Show the leader clearly, but only once someone has at least one point.
  - Points are shown as "1 point" or "N points".
- The score panel updates after every vote and after every round.

---

## 7. Coverage tracker

Show the six lifecycle phases (Recruitment, Consent, Data collection, Analysis, Dissemination, Aftercare), marking which phases have been covered by the dilemmas dealt so far. Show a count of dilemmas played out of 30.

---

## 8. Timer

An optional countdown timer for talk time. It offers at least one minute and three minutes, a stop control, and an announcement when time is up. It does not affect scoring or play.

---

## 9. Good-practice library

- A running record of every saved mitigation and testimony line, organised into one column per principle.
- Each column shows:
  - the number of items filed
  - the principle's name and guiding question
  - each mitigation, with the dilemma it came from
- A column with no items should say so plainly (for example "Nothing filed here yet").
- Mitigations filed under several principles appear in each of those columns.
- Testimony lines show that they came from a testimony card, not a dilemma.
- UGC complications that were played are marked as UGC wherever they appear.

---

## 10. Session write-up

Produce a Markdown write-up of the session with:

1. A heading and a one-line description of the session, with the number of players and completed rounds.
2. Each round in order:
   - the dilemma (or the testimony card) and its category
   - the scenario text
   - the worst complication (the card the table voted for), with "(UGC)" where it applies
   - the player who played it
   - the agreed mitigation
   - the principles it was filed under
3. The library, by principle, with the count for each.
4. Any principles not reached in the session, listed together.

Offer two actions: **show the text** and **copy to clipboard**. Downloading as a file is optional. Where the platform cannot copy or download, show the text in a box that the user can select and copy.

---

## 11. Accessibility and language

- The game must be fully usable with a keyboard and a screen reader. Every control needs a clear label. Status changes (such as handovers, reveals and votes) are announced in a live region.
- Meet WCAG 2.2 AA for contrast and target size. Colour must never be the only way information is conveyed.
- Respect the user's reduced-motion setting. Keep any animation minimal and optional.
- Do not use dialogs that block the page for confirmations. Build confirmation steps into the page itself.
- Keep all copy short, plain and free of jargon. Avoid repeating the same instruction on more than one screen.

---

## 12. Saving and resuming

- Save the game state on the device after every change, so a reload resumes the same round exactly.
- Restore a saved game on load. A new game clears the saved state.
- Saved state must include: players, deck positions, the current dilemma, every hand, every lock, passes, whose turn it is, which player's cards are showing, votes, the log of saved rounds, and the score.
- Store nothing about players outside the device.

---

## 13. Edge cases to handle

- **All players pass**: the round ends with no point and no mitigation. Move the dealer on and start the next round.
- **Only one player left to lock**: the turn passes to them automatically.
- **Tie in votes**: the dealer chooses the winner. Do not award a point until it is chosen.
- **Empty dilemma deck**: end the game and show a clear message, and keep the library and write-up available.
- **Swap during a round**: allowed only before the reveal.
- **Reload mid-turn**: resume with the same player's cards showing if they were showing before the reload.
- **Fewer complications available**: this should not happen with 20 per dilemma, but if a hand cannot be filled, deal as many as are available and log a warning.

---

## 14. Data model (suggested)

```
Game {
  players: [{ name, hand: [complicationId], locked: [complicationId], passed, points }]
  dealer, round, turn, shown,        // shown = index of player whose cards are visible, or null
  dilemmaDeck: [dilemmaId], playedDilemmas: [dilemmaId], currentDilemma,
  testimonyDeck: [testimonyId], currentTestimony,
  votes: { playerIndex: count },
  winner,                            // set after the vote is confirmed
  log: [Round]
}

Round {
  round, kind: "dilemma" | "testimony",
  dilemmaId | testimonyId,
  worstComplicationIds: [complicationId],
  winnerName,
  mitigation: string,
  principles: [principleIndex],      // one or more; for testimony lines, exactly one
  playedBy: [name]
}

Complication {
  id, text, dilemmaId,
  ugc: boolean, removed: boolean
}
```

Store user-written (UGC) complications alongside the content, with `ugc: true`, so they can be checked later.

---

## 15. Deliverables

1. A single-page app that runs offline on one device, with no server and no accounts.
2. Content files for dilemmas, complications, testimony and principles, validated on load (for example, each dilemma has exactly 20 complications).
3. Automated tests for:
   - dealing: hands come only from the current dilemma, the right size, and never contain duplicates
   - hidden play: turn order, handovers, passing and re-joining, hiding, and that a locked card cannot change
   - voting: no self-votes, ties, and the single point per round
   - mitigation filing: one entry under each ticked principle
   - swap: redeals every hand and clears locks, and is blocked after reveal
   - score ranking, including ties
   - save and resume
4. A short README for the facilitator: how to set up, how to run a round, and how to check UGC complications.

---

## 16. Things to decide before building

- The source of truth for the six principle colours (see section 3.1). Pick colours that are distinct, colour-blind safe, and always labelled.
- Whether UGC complications are shared across sessions. The current prototype keeps them on the device only.
- Whether the testimony round should allow more than one principle per line. The current prototype allows one.
- Whether a facilitator can remove a UGC complication from the game. The current prototype allows removal from the library.
