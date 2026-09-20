# Tech Workspace / IDE Journal — Theme Blueprint

## Status

**Approved as the first implementable profile theme.**

This theme turns `/{handle}` into a personal technical workspace: part IDE, part terminal, part changelog, part technical publication. It is designed desktop-first. It must be original product UI inspired by familiar developer workflow patterns, **not a copied clone** of VS Code, JetBrains, Cursor, Claude, ChatGPT, Apple/macOS, Windows, or any other product.

## Legal guardrails

- Do not use screenshots, copied app chrome, proprietary icons, mascots, logos or distinctive UI screenshots as production assets without a licence/permission.
- Do not use a founder/CEO likeness as a default “mascot” without a written licence/consent. A public-facing sticker can imply endorsement and adds image/publicity and trademark risk.
- Safe default: original abstract “guide” mascots, role-based avatars (builder, maintainer, researcher), or an original geometric creature whose colours can follow a selected stack.
- Brand names and factual commentary can be used editorially where appropriate, but product theme art must remain independent. Official logos/brand assets may be considered only after checking the specific brand's official usage guidelines.
- “Inspired by IDE workflow” is safe as a concept; copying distinctive visual expression is not. Copyright protects original visual art and public display/adaptation normally needs authorisation. Non-commercial use alone does not settle fair-use analysis. [U.S. Copyright Office](https://www.copyright.gov/engage/visual-artists/), [fair-use guidance](https://www.copyright.gov/fair-use/more-info.html?trk=article-ssr-frontend-pulse_little-text-block), [WIPO FAQ](https://www.wipo.int/en/web/copyright/faq-copyright).

## 1. Theme identity

### Product promise

Every technical writer gets a profile that feels like **their own focused desktop workspace**. A reader lands in a polished “workspace home”, then enters article tabs, documentation, terminal notes and review pages without losing reading quality.

### Default personality

- Deep charcoal canvas, soft elevated panels, precise type hierarchy, restrained syntax colours.
- Editorial content remains more important than decorative code.
- Familiar IDE cues: activity rail, explorer tree, tab strip, breadcrumbs, status bar, command palette, terminal drawer, diff/review marks.
- User switches between a **macOS desktop frame** and a **Windows desktop frame**. This changes only the neutral window/terminal shell; it does not impersonate an operating system or copy its artwork.
- The author selects a “workspace pack” based on subject matter: Odoo/ERP, Python/data, web frontend, Vue, Java, C/C++, .NET, terminal/Unix, AI desk, general research.

## 2. Page system

### A. Profile home: Workspace overview

```text
┌ app/window frame ─ product-original ──────────────────────┐
│ workspace title · author · subject pack · search/command  │
├ activity rail ┬ explorer / index ─┬ editor / featured post │
│ icons         │ folders/categories│ active article tab     │
│               │ collections       │ profile introduction   │
│               │ pinned notes      │ selected project card  │
├───────────────┴───────────────────┴────────────────────────┤
│ optional terminal / activity / now playing drawer          │
└ status bar: profile handle · theme · reading time          ┘
```

Home blocks:

1. **Workspace identity bar**: profile name, role, location/timezone optional, current focus.
2. **Activity rail**: navigation to Overview, Writing, Collections, Notes, Media, Links. Must use original iconography.
3. **Explorer tree**: categories as folders; collections as repositories/projects; posts as files.
4. **Featured editor**: one selected post visually open as the active tab.
5. **Pinned notes / scratchpad**: 3–6 concise notes, links or current tasks.
6. **Recent commits**: article feed rendered as a changelog timeline, without pretending to be a real Git provider.
7. **Terminal card**: optional author-owned short text/status, not executable terminal.
8. **Footer/status bar**: profile language, theme pack and decorative build/version string.

### B. Archive/category: File explorer

- Category is a folder, post is a file, collection is a project/repository.
- User can choose tree, list, cards, commit log or documentation index as an archive recipe.
- Tags appear as language/framework chips, but never imply official product affiliation.
- Search/filter is a command-palette-style overlay.

### C. Article: Reader/editor modes

Each post may choose one presentation:

1. **Editor document** — article in a syntax-aware reading editor; code blocks and callouts are strong.
2. **Documentation** — left table of contents, central prose, right “on this page”/related links.
3. **Terminal log** — chronological troubleshooting/build log; excellent for daily dev notes.
4. **Diff/review** — before/after analysis, decision records, code-review or implementation story.
5. **Notebook** — research/data article with cells, output cards, charts and annotations.
6. **Release note** — product update/article cards with version, changes, media and changelog.

No post should become a literal multi-page book by default. Technical long-form content needs normal vertical reading. “Pages” are optional explicit sections/tabs, not arbitrary splits.

## 3. User-facing Deco controls

### Workspace shell

- Shell: `macOS inspired` / `Windows inspired` / `minimal frameless`.
- Window density: focused / balanced / expanded.
- Window controls: original red-yellow-green-like neutral dots or abstract square controls; never copied vendor glyphs.
- Show/hide activity rail, explorer, terminal, status bar, breadcrumbs.
- Editor tab style: compact / paper tabs / rounded / sharp.

### Subject pack

- Generic Tech (default)
- Odoo / ERP
- Python / Data / Notebook
- Java / JVM
- Web Frontend
- Vue ecosystem
- C / C++ systems
- C# / .NET
- Terminal / Unix
- AI Desk
- Custom neutral palette

Each pack changes palette, original stickers, category labels, code-language colours and optional small background motifs. It must not change core information architecture.

### Content layout

- Home recipe: workspace overview / dashboard / terminal-first / documentation-first / release board.
- Archive recipe: explorer / commits / cards / docs index.
- Post recipe: editor / docs / terminal log / diff / notebook / release note.
- Featured post selection, pinned notes and collection ordering.
- Optional layout region drag/reorder within safe grid slots; no free arbitrary CSS canvas.

### Detail and motion

- Background: solid / subtle grid / scanline / dot matrix / paper-code hybrid.
- Accent colour from pack palette.
- Syntax theme: midnight / warm dusk / high contrast / light terminal.
- Cursor blink, terminal typing, subtle tab switch, panel opening, optional fake build indicator.
- Reduced motion toggle is mandatory.

## 4. Asset list to prepare/create

The first default can be largely code-native SVG/CSS, but these asset packs make it rich and personal. Send references gradually; implementation will create originals where possible.

### 4.1 Build in code, no external assets required

These are product-original CSS/SVG components:

- Window frames for macOS-inspired, Windows-inspired and neutral shells.
- Activity-rail icon family: overview, files, writing, collection, note, media, links, search, Deco.
- Original window control dots/buttons.
- Explorer folder/file/tree disclosure icons.
- Editor tabs, breadcrumbs, status bar and terminal prompt UI.
- Command palette, search dialog, code block chrome, diff markers, notebook cell chrome.
- Generic syntax colour themes and language labels.
- Original stack glyphs: brackets, terminal prompt, database cylinder, package cube, notebook cell, AI spark, web globe, graph.

### 4.2 Subject-pack mascots/stickers — assets to send or create

Prefer original characters/objects; use transparent PNG/WebP, at least 512px, with 2–4 variants each.

| Pack | Original mascot/sticker direction | Asset count |
| --- | --- | ---: |
| Generic Tech | little build bot, cable creature, blinking cursor sprite, stack of disks | 8–12 |
| Odoo / ERP | modular green cube helper, ledger book, process arrows, warehouse label, puzzle module | 8–12 |
| Python / Data | data firefly, notebook creature, chart/plot sticker, flask, array tiles | 8–12 |
| Web Frontend | browser sprite, component blocks, responsive devices, CSS paint brush | 8–12 |
| Vue ecosystem | green geometric leaf/triangle creature, component tree, reactive signal lines | 8–12 |
| Java / JVM | warm coffee/byte motif, class blocks, pipeline arrows | 8–12 |
| C/C++ systems | circuit fox/robot (original), chip, pointer arrows, debugger scope | 8–12 |
| C# / .NET | purple orbit/constellation helper, service nodes, API route cards | 8–12 |
| Terminal / Unix | shell prompt sprite, star/asterisk, directory tree, server rack | 8–12 |
| AI Desk | original thoughtful assistant orb, prompt cards, context ribbon, model blocks | 8–12 |

**Do not use** Mark Zuckerberg, Fabien Pinckaers, named developer portraits, or real-person stickers as defaults. If the user later requests a real-person editorial portrait in a specific article, it needs a separate rights/source review.

### 4.3 Background and texture assets

- 6 background treatments: charcoal, warm dark, midnight blue, terminal green-black, notebook light, warm paper-tech.
- 5 subtle overlays: dot grid, graph grid, scanline, terminal noise, faint topology/network.
- 8 desktop wallpaper images/illustrations for optional workspace background; no app screenshots.
- 12 small panel patterns: circuit traces, brackets, code rain abstract, data points, UI wireframes.

### 4.4 Article and media assets

- 10 hero/cover templates, either source artwork or components ready for user image placement.
- 8 code/terminal callout illustrations.
- 8 diff/review annotations: add, modify, warning, decision, approved, experiment, deprecated, performance.
- 8 notebook/data illustrations: chart, table, dataset, experiment, insight, metric, notebook, pipeline.
- 12 small badges: guide, tutorial, note, review, release, video, snippet, case study, worklog, research, opinion, archive.

### 4.5 Icon set

Use original SVG, 16/20/24/32px, outline + active state:

- global: home, profile, write, archive, collection, search, settings, preview, save, reset.
- workspace: explorer, source control (generic branch), terminal, notebook, AI, database, package, docs, run/play, bug, build.
- article: file, folder, code, comment, bookmark, link, share, copy, quote, image, video, audio, table, chart.
- action/state: add, remove, change, warning, info, success, error, pending, locked, public/private.

## 5. Platform reference matrix

These are interaction references, not templates to clone.

| Reference family | Borrow safely | Do not copy |
| --- | --- | --- |
| VS Code / code editors | three-region workspace model, tabs, explorer hierarchy, readable code/editor rhythm | icon set, brand, exact UI, screenshots |
| JetBrains IDEs | dense professional hierarchy, tool-window logic, inspector/detail layout | logos, window chrome, colour/system UI duplication |
| Sublime/Text editors | distraction-free reading, minimal commands, compact tabs | exact chrome/assets |
| Notebooks / data tools | cells, outputs, experiment narrative, chart-first notes | proprietary visual UI or branding |
| Terminal apps | prompt rhythm, command output narrative, status context | copied terminal app visuals/logos |
| AI desktop apps | conversation cards, context/workspace mental model, model/task status | names/logos/brand-specific chrome |

## 6. Desktop variants

### macOS-inspired

- top window bar with three original circular controls at left;
- soft rounded container, calmer blur/shadow, compact traffic-light-inspired neutral control language;
- terminal uses a clean prompt with warm/dark palette;
- no Apple logo, system menu, San Francisco requirement, wallpaper screenshot or macOS system icons.

### Windows-inspired

- square/compact window controls at right, sharper panels and task-oriented status area;
- terminal uses a more structured command/pane layout;
- no Windows logo, taskbar, system icons, fonts, wallpaper screenshot or copied shell design.

### Neutral / web-native

- default for users who do not want an OS frame;
- retains tabs/explorer/editor rhythm but has original web chrome;
- recommended public/default experience.

## 7. Implementation order

1. Build **Neutral Tech Workspace** as the actual default: CSS/SVG only, desktop profile home + editor article reader.
2. Add macOS-inspired and Windows-inspired shell variants around the same content renderer.
3. Add Generic Tech asset pack and one Odoo/ERP pack using original glyphs/stickers.
4. Add Deco controls for shell, pack, density, background, archive recipe and post recipe.
5. Add Python/Data, Web Frontend and AI Desk packs.
6. Add advanced layout reorder, subtle motion and optional desktop wallpaper assets.
7. Mobile/app is a separate later art direction phase.

## 8. Intake checklist for reference images

When sending screenshots/references, mark each as one of:

- `layout reference` — use structure only, never copy pixels/assets;
- `mood reference` — use colour/feeling only;
- `asset candidate` — must include source/licence/ownership before use;
- `original asset` — can be stored and processed for the theme.

For each original asset, include intended pack, desired position and whether it is desktop-only.
