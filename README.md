# Co-creating a Trauma-Informed Accessibility Research Practice — ASSETS 2026 Workshop

Source for the workshop website. Single static page, no build step.

## Deploy on GitHub Pages

1. Create a repository (e.g. `trauma-informed-accessibility-workshop`).
2. Add `index.html` (and this README) to the default branch.
3. In the repository, go to **Settings → Pages**, set **Source** to *Deploy from a branch*, choose your default branch and the `/ (root)` folder, and save.
4. The site publishes at `https://<user-or-org>.github.io/<repo>/` within a minute or two.

No framework, bundler, or dependencies — the page is self-contained apart from Google Fonts loaded over HTTPS.

## Placeholders to confirm before or shortly after launch

These are marked on the page as *To be confirmed* or point to the main ASSETS site. Update `index.html` directly once known:

- **Workshop format** (on-site vs virtual) — currently marked *To be confirmed* in the hero, the participation section, and the footer.
- **Workshop day** — set provisionally to 25 October 2026 (ASSETS runs 25–28 Oct). Confirm against the official ASSETS 2026 workshop programme.
- **Early registration deadline** — links to the ASSETS 2026 site rather than stating a date. Add the confirmed date once published; the notification date (28 Aug 2026) is set to precede it so accepted authors can register in time.
- **Submission deadline / notification** — 7 Aug and 28 Aug 2026 are working dates; adjust if needed.
- **Submission link** — currently points to the workshop Google Site. Replace with the final submission form or system if different.

## Accessibility

Built to target WCAG 2.2 AA:

- Semantic landmarks (`header`, `nav`, `main`, `footer`) and a logical heading order (single `h1`, no skipped levels).
- Skip link to main content; visible keyboard focus with a high-contrast ring.
- All text/background colour pairs meet AA contrast (≥ 4.5:1 for body text; the non-text focus ring clears 3:1).
- `prefers-reduced-motion` respected; no motion is essential.
- Tables use `<th scope>` and a caption where needed.
- The call for participation is HTML text, not a PDF.

If you change colours, re-check contrast (e.g. with the WebAIM contrast checker) before publishing.
