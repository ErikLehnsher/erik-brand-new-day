# Profile Theme System — Product Memory

> This document is the canonical product memory for the profile-theme system. It records the approved direction before implementation. Do not reduce the profile to a single colour palette or a generic “blog skin”. A profile is a small, personal website with a coherent visual world.

## 1. Product decision

Each user profile is a **mini-site** at `/{handle}`. It has its own identity, home page, category/archive pages, post-reading experience, decorative assets, and motion language.

The platform must provide:

1. **Curated default themes**: complete, art-directed presets that work with no design skill required.
2. **Safe deep customization**: a user can personalise a selected theme without breaking its visual world.
3. **Asset-first themes**: the supplied illustrations/icons/textures are fixed product assets. Users select from them; they do not need to design a site from scratch.
4. **Theme inheritance**: profile default → optional category style → optional post style. A post may inherit its profile theme or deliberately use a compatible sub-variant.
5. **Responsive parity**: desktop and mobile are distinct art-directed layouts, not merely a squeezed desktop page.

The first complete theme is **Ghibli Journal**. It must be built as a reusable theme system, not one hard-coded page.

## 2. Core interaction model

### Profile ownership

- Visitor: reads a public profile and its posts; never sees editing controls.
- Profile owner: on their own profile sees a compact `Deco` button.
- `Deco` opens the Profile Studio, not a separate admin menu.
- The global user dropdown contains only `Trang cá nhân`; profile configuration lives inside the profile itself.

### Theme lifecycle

1. User opens `Deco`.
2. User chooses a theme preset, initially `Ghibli Journal`.
3. The product applies a polished default arrangement and its default asset pack.
4. User optionally changes individual controls in grouped sections: Scene, Paper, Header, Notes, Posts, Motion and Details.
5. User can reset either one section or the whole theme to the preset default.
6. User can preview desktop/mobile before publishing.

### Scope boundary

- A profile is a mini-site, not an unrestricted website builder.
- User can select, reorder and position approved blocks/assets within guardrails.
- User cannot inject arbitrary HTML/CSS/JavaScript.
- All user-selectable values are validated theme tokens or asset IDs.
- Page loading/performance optimisation is a later concern; visual system, schema, and asset inventory come first.

## 3. Theme architecture

### Theme layers

```text
Theme package
  ├── base tokens (colour, type, spacing, shape, shadow, motion)
  ├── asset library (illustrations, icons, paper, textures, stamps)
  ├── layout recipes (profile home, archive, post, collection)
  ├── interactive recipes (drag note, page turn, scrapbook reveal)
  ├── default composition (the “looks beautiful immediately” version)
  └── customization schema (what an owner may edit)

Profile configuration
  ├── selected theme package
  ├── selected layout recipe per page type
  ├── chosen theme assets and their placement
  ├── custom copy / avatar / links / featured content
  └── per-post override, constrained to compatible recipes
```

### Data direction (for later implementation)

- `ThemeDefinition`: product-owned manifest/version; never user editable.
- `ThemeAsset`: fixed image/icon/video/texture metadata; includes placement rules and alt text.
- `ProfileThemeSettings`: user selections only, stored as validated JSON.
- `ProfileBlock`: ordered blocks such as hero, note wall, featured post, category shelf, guestbook, footer.
- `PostPresentation`: optional theme/layout override for a post.
- `AssetPlacement`: chosen asset ID, anchor, scale, rotation, depth, visibility breakpoint; values clamped by each recipe.

### Recommended folders when coding begins

```text
FE/
  app/[handle]/                         public profile routes
  app/studio/profile/                   Deco studio
  components/profile-theme/
    renderer/                           generic theme renderer
    studio/                             controls and preview
    motion/                             reusable interaction primitives
    ghibli-journal/                     first theme implementation
  lib/themes/
    registry.ts
    ghibli-journal.manifest.ts
  public/themes/ghibli-journal/
    images/
    icons/
    textures/
    audio/                              optional, off by default
    manifest.json
BE/
  app/domains/themes/
    definitions.py
    validation.py
    service.py
```

## 4. First default theme: Ghibli Journal

### Mood and rules

The theme should evoke a **handmade, gentle animated journal**: sunlit paper, botanical details, slightly imperfect ink, field notes, little travel objects, cosy rooms and small magical movement. It should feel inspired by the emotional qualities of hand-drawn animation, **not imitate any copyrighted character, film frame, logo, or specific Studio Ghibli artwork**.

Visual rules:

- Warm cream paper, moss green, faded sky, terracotta, ink brown and muted golden light.
- Handwritten accent font only for small labels/notes; body text stays highly readable.
- Real article content remains the primary object. Decoration frames it; it must not obscure text or controls.
- Imperfection is controlled: paper grain, deckled edges, taped photographs, uneven ink, not random clutter.
- Motion is calm and short: breeze, floating dust, note lift, page turn. Always respect reduced-motion preference.

### Default composition

#### A. Profile home

1. **Sky/header strip**: a calm illustrated or textured band, with tiny cloud/leaf drift.
2. **Nameplate**: profile name printed on a paper label or wooden sign.
3. **Hero scene**: one principal illustration/photo, profile avatar as a pinned polaroid or circular wax-seal portrait.
4. **Intro note**: bio on a torn note card, slightly rotated by a safe amount.
5. **Navigation trail**: category tabs as paper tickets, leaf tabs or small library cards.
6. **Featured shelf**: 1 large featured post plus 2–4 smaller postcard/note posts.
7. **Notes wall**: short posts rendered as draggable-looking notes; only owner can actually arrange them in Deco.
8. **Collection trail**: grouped writing presented as a travel map, bookshelf or envelope set.
9. **Footer scene**: illustrated ground line, plants and optional small mascot; no copyright character.

#### B. Category / archive

- Category has an optional “scene card” (e.g. rainy desk, meadow, train window, kitchen shelf).
- Posts render as a responsive journal shelf: featured wide card first, then postcard/note grid.
- Filter/sort uses simple paper controls, never dense admin controls.
- Pagination appears as page markers, bookmarks or a small “next trail” button.

#### C. Post reading page

The owner chooses one of these approved reading recipes:

1. **Notebook**: lined or dot-grid paper, binder holes on desktop, soft page shadow.
2. **Open book**: long articles become sequential spreads; on desktop two pages may appear side by side, but reading must remain vertically accessible and mobile-safe.
3. **Field letter**: writing is on a letter sheet with stamp, date, destination, photo pockets.
4. **Photo diary**: image-first article with taped polaroid moments between text blocks.
5. **Retro cinema journal**: for reviews/video, with ticket, screening date, rating stars and film-strip media.

Multi-page post behaviour:

- Author explicitly inserts a page break in the editor; never auto-split prose arbitrarily.
- Each page has optional page number, decorative corner and background variation.
- Next/previous page buttons are accessible; keyboard and swipe work on mobile.
- A gentle page-turn visual may play when navigating, but the actual content uses normal routes/state so it remains searchable, shareable and accessible.
- User can choose `scroll`, `book`, or `letter pages` per post. Default is `scroll` to protect readability.

## 5. Ghibli Journal asset inventory — what to collect

All assets need transparent-background PNG/WebP where relevant, named consistently, and an accompanying licence/source record. Prefer original commissioned work, self-made material, or properly licensed asset packs.

### 5.1 Required hero and profile assets

| Asset group | Quantity | Formats / ratios | Where used | User can select |
| --- | ---: | --- | --- | --- |
| Profile hero scenes | 8–12 | desktop 16:6, mobile 4:3 | Profile home hero | Scene, crop, overlay strength |
| Profile avatar frames | 10–14 | transparent 1:1 | avatar/polaroid frame | Frame, tape/pin/seal |
| Nameplate frames | 8 | transparent wide 3:1 | profile name | paper/wood/label style |
| Bio note cards | 12 | transparent wide/portrait | bio panel | note shape, rotation, pin |
| Featured-post backdrops | 10 | 3:2 | first post card | card scene/background |
| Profile dividers | 12 | repeatable SVG/PNG | section boundaries | divider motif |

Hero-scene subjects to source/create:

- sunrise meadow and long grass
- rainy window with warm indoor light
- quiet reading desk with tea and leaves
- train compartment/window with moving countryside
- small town lane at late afternoon
- greenhouse/garden shelf
- attic room with postcards/maps
- lakeside or riverbank with reeds
- kitchen table and handwritten recipe book
- starry dusk with paper lanterns
- forest path with small wayfinding signs
- seaside cliff with soft clouds

### 5.2 Decorative cutouts and “living” objects

These must be transparent cutouts, ideally supplied in 2–3 pose/size variants.

| Group | Suggested count | Placement anchors |
| --- | ---: | --- |
| Leaves, grass, wildflowers | 30–50 individual / 8 clusters | corners, footer, card edges, hero foreground |
| Clouds, sun, moon, stars | 20 | header, page corners, post headers |
| Birds, butterflies, moths | 16–24 | motion layer, empty space, archive banners |
| Books, envelopes, postcards, maps | 20–30 | collections, post metadata, note wall |
| Teacups, kettle, jars, pens, pencils | 20–30 | desk/reading recipes |
| Travel objects: ticket, compass, suitcase, camera | 15–20 | field letter / travel collection |
| Sewing/tape/pin/seal/wax/clip | 25–35 | note attachment and photo frame detail |
| Small original mascots / woodland spirits | 8–12 | footer, empty state, loading later; original only |
| Sparkles/dust/wind strokes | 15–20 | subtle animation overlays |

### 5.3 Paper, print and texture assets

| Asset | Quantity | Technical notes | Editable setting |
| --- | ---: | --- | --- |
| Base paper textures | 6 | seamless, 2048px+ | cream, oatmeal, green, blue, night, recycled |
| Notebook paper patterns | 6 | seamless | blank, ruled, grid, dot grid, ledger, music sheet |
| Torn-paper edges | 16 | transparent horizontal/vertical/corner | edge type |
| Tape strips | 20 | transparent | colour, width, tilt |
| Stamps/postmarks | 20 | transparent, 1:1 | date stamp, travel mark, category mark |
| Ink brushes/underlines | 20 | SVG preferred | highlight/underline ornament |
| Grain/dust overlays | 4 | low-opacity repeatable | texture intensity |
| Film / photo borders | 10 | transparent | visual recipe |
| Fabric/wood/corkboard backgrounds | 8 | seamless or large | note-wall surface |

### 5.4 Icon system

Icons must include outline and filled states, sized at 16/20/24/32px. Use a coherent hand-ink style; do not mix emoji with the product icon set.

**Global navigation**

- home, profile, write/new post, archive, category, collection, search, menu, close, back, forward
- light/dark or sun/moon, settings/Deco, preview desktop/mobile, save, reset, undo/redo

**Content and post actions**

- read, bookmark, heart/appreciate, comment, share, copy link, print, download, report
- image, gallery, video, audio, quote, code, page break, map pin, date, clock, tag, link

**Ghibli Journal decorations**

- leaf, flower, mushroom, bird, butterfly, cloud, raindrop, star, lantern, teacup, book, envelope, pencil, camera, ticket, train, house, mountain, wave

**Studio/Deco controls**

- drag handle, rotate left/right, scale, layer up/down, lock/unlock, hide/show, duplicate, delete, crop, palette, paper, frame, sticker, motion, accessibility

### 5.5 Post-specific media asset packs

Each post can select a compatible pack rather than arbitrary unrelated decoration.

| Pack | Best for | Required assets |
| --- | --- | --- |
| Morning notes | daily writing | mug, window light, notebook, small flower, ruled paper |
| Rainy letters | reflective essays | rain window, envelope, stamp, blue-grey paper, raindrops |
| Garden log | nature/life | pressed leaf, seed packet, fern, label stake, botanical paper |
| Journey notes | travel | ticket, map, train, camera, postmark, suitcase |
| Film evening | reviews/video | ticket stub, stars, film strip, projector glow, rating mark |
| Recipe corner | food/memory | recipe card, spoon, herb, tablecloth, kitchen label |
| Night diary | intimate/long form | moon, lamp, moth, deep blue paper, constellation marks |

## 6. What the owner can customise in Deco

Controls are grouped. Every selector starts from the theme default and includes Reset.

### A. Identity

- display name, handle, bio, avatar
- avatar treatment: plain / polaroid / wax seal / round label / pinned card
- social/website links (later)
- profile visibility

### B. Scene

- hero scene
- time of day colour grade: morning / afternoon / rain / dusk / night
- foreground cutout set
- ambient density: quiet / gentle / lively
- optional section scene per category

### C. Paper and palette

- base paper texture
- ink colour
- accent palette from approved combinations
- line style: pencil / fountain pen / faded typewriter
- shadow depth: flat / paper lift / deep scrapbook
- card edge: clean / torn / deckled / stitched

### D. Layout

- profile home recipe: journal shelf / note wall / travel board / photo diary
- featured post arrangement
- post-card shape: postcard / paper note / polaroid / book cover
- category navigation: tickets / leaf tabs / library cards
- collection presentation: map / bookshelf / envelope set
- density: airy / balanced / rich

### E. Notes and draggable composition

- enable notes wall
- choose note template
- add approved sticker/cutout
- drag within a bounded canvas
- rotate within a safe range (for example -8° to +8°)
- scale within safe range
- layer order
- pin/tape/seal attachment
- owner-only free positioning; visitors see the saved composition only

### F. Post presentation

- inherit profile default or select a compatible reading recipe
- page format: scroll / open book / field letter / photo diary / retro cinema journal
- cover frame and media frame
- reading-width density
- metadata motif: stamp / ticket / label / handwritten note
- per-post asset pack
- decorative intensity

### G. Motion

- motion master toggle
- subtle wind (leaves/clouds)
- note hover lift
- image/polaroid parallax (very small)
- page turn for explicit multi-page posts
- reveal style: fade / paper slide / stamp / none
- movement must be disabled automatically when `prefers-reduced-motion` is enabled

### H. Accessibility and safety

- high-contrast text mode
- reduce texture/animation
- always-visible reading mode for posts
- all decorative images require theme-provided alt text or are explicitly marked decorative
- controls must be keyboard accessible; drag has non-drag arrow controls

## 7. Build sequence

Do not build every theme or every control at once.

### Phase 0 — this document / asset collection

- Finalise the Ghibli Journal asset inventory.
- Receive only licensed/original assets and record their source.
- Decide exact font licences and fallback fonts.
- Create a small manifest with IDs and previews.

### Phase 1 — static Ghibli Journal default

- Build profile home, category archive and post reading pages using a single beautiful default composition.
- No drag/drop yet.
- Use placeholder asset slots until the final assets arrive.
- Establish responsive desktop/mobile recipe and accessibility baseline.

### Phase 2 — Deco Studio

- Theme picker, preview, section reset and draft/publish.
- Identity, scene, paper/palette and layout selectors.
- Save only validated settings to the profile.

### Phase 3 — notes, page recipes and motion

- Bounded note wall composition.
- Explicit post page breaks and book/letter recipes.
- Motion primitives, reduced-motion support and keyboard alternatives.

### Phase 4 — compatible post packs and future themes

- Add post-specific packs.
- Add further complete themes (newspaper, retro, cinema, scrapbook, minimal), using the same manifest/renderer architecture.

## 8. Asset delivery checklist for the user

When sending assets, please group them like this:

```text
ghibli-journal-assets/
  hero-scenes/
    meadow-morning-desktop.webp
    meadow-morning-mobile.webp
  avatar-frames/
  nameplates/
  notes/
  post-covers/
  decorative-cutouts/
    botanical/
    sky/
    desk/
    travel/
    mascots-original/
  textures/
  icons/
  post-packs/
    morning-notes/
    rainy-letters/
    garden-log/
    journey-notes/
    film-evening/
```

For every image provide, where possible:

- intended section/usage;
- desktop/mobile suitability;
- whether it is decorative or meaningful content;
- licence/source/ownership;
- preferred crop and any asset that must never be recoloured;
- transparent PNG/WebP for cutouts, SVG for simple icons, WebP/AVIF for large backgrounds.

## 9. Acceptance criteria for the first theme

- A new user can select Ghibli Journal and receive a complete, beautiful profile without arranging anything.
- The profile, archive and post page visibly belong to the same visual world.
- Owner sees `Deco` only on their own profile.
- A visitor sees no editing controls.
- At least one profile recipe, one archive recipe and three post recipes work on desktop and mobile.
- Decorations never hide body text, controls or media captions.
- Page-turn and note effects are optional, accessible and reduced-motion safe.
- Every asset is product-owned/licensed/original and registered in a manifest.
