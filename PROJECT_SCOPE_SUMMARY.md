# Erik Brand New Day - Project Scope Summary

## Project identity

- Repository name: `erik-brand-new-day`
- Repository path: `/Users/eriklehnsher/Projects/personal_project/erik-brand-new-day`
- Repository role: the foundation of Erik's personal brand and digital ecosystem.
- The product is **not only a lunar calendar app**. Its backbone is a personal blog, with calendar, reminders, and future personal tools added as connected modules.
- Short English description:

  > A personal digital home for stories, ideas, calendars, and everyday tools.

## Current workspace convention

- The repository should be organized as two top-level folders only:
  - `FE/` for the frontend
  - `BE/` for the backend
- Backend direction has been updated to **FastAPI**.
- The backend will run with PostgreSQL as its primary database.
- Local development should use a normal SQL database installation rather than Docker.
- Database setup should use the existing local PostgreSQL user `eriklehnsher` as the developer/app role.
- The project database is `erik_brand_new_day`.
- The backend should connect to PostgreSQL using that local user and database directly.
- Local development should use `.env.local`, while `.env.example` stays as the server/deploy template with separate DB credentials.
- Backend settings should prefer `.env.local` first and fall back to `.env`, with `APP_ENV` and `DEBUG` controlling local versus production behavior.
- Authentication scope includes:
  - login and logout
  - Google sign-in/linking
  - password reset / change-password emails
- Outgoing email can use the user's personal Google email server setup.
- Current implementation focus is on the auth foundation and personal blog-first product shell.
- Current implementation now includes:
  - FastAPI backend scaffold
  - PostgreSQL connection settings
  - email/password auth routes
  - posts table and blog post API with seeded published content
  - Google auth-linking placeholder route
  - password reset email flow placeholder
  - Next.js frontend shell with login/logout routes, a blog homepage that reads from the post API, and a create-post screen
- Backend runtime should target Python 3.11, which is available in this workspace.
- Backend auth schemas use `EmailStr`, so `email-validator` is required in the Python environment.
- VS Code should ignore `BE/.venv` so the editor does not surface warnings from third-party site-packages.
- Password hashing has been updated away from bcrypt so long passwords are supported normally.
- The Python environment must include `argon2-cffi` for the Argon2 password hasher backend.
- The frontend currently uses `npm` and a `FE/package-lock.json`; the stale root `pnpm-lock.yaml` should not be kept because it confuses Next.js workspace detection.
- FE dev should bind to `127.0.0.1:3000` locally to avoid sandbox binding issues.
- FE now includes a shared header menu plus dedicated `/about`, `/login`, `/register`, and `/logout` routes with auth-screen layout and client-side submit flow.
- `/login` and `/register` are wired to the shared `AuthForm` client component, and successful auth stores a local session so the header can switch into user mode.
- The header now shows the signed-in user name and a dropdown with user detail actions when a local session exists.
- The homepage has been converted from the old landing copy into a blog-first post feed, while the original landing content moved into `/about`.
- A `/posts/new` screen now lets a signed-in user create a new post and jump straight to the new post detail page.
- The create-post screen now uses a Tiptap-based Notion-like editor with slash commands, inline image upload, font selection, text color controls, and block formatting.
- Post bodies are now stored as serialized TipTap JSON in the `content` field so the editor can evolve without changing the database shape immediately.
- The create-post editor body has been widened and expanded so it feels closer to a true Notion-style writing surface rather than a narrow form.
- The create-post screen has now been reworked into a single-column document canvas so the page reads more like a Notion editor and less like a split metadata form.
- Slash-command selection on the create-post editor now applies block formatting immediately, supports Enter-to-select, and images are constrained to the editor width so they stay inside the document canvas.
- FastAPI must allow CORS from local FE origins (`localhost:3000` and `127.0.0.1:3000`) so browser auth requests do not fail.
- FE visual direction now leans vintage Wes Anderson with a red-dominant background, plus gold and brown accents.
- FE accent direction now gives red the main role, with cat/dog mascot cutouts inspired by the provided reference and placed directly into the UI.
- The provided portrait image should be used as the home-page brand identity card and future author/about hero asset.
- Cat/dog mascot icons should stay larger and more poster-like, but use real cutout images rather than the earlier SVG blend placeholder.
- The home page now uses `/brand/cat-poster.png` for the cat poster and `/brand/header-dog.png` for the dog cutout asset in the gallery, header, and footer.
- The header brand mark now uses larger cutout cat and dog images instead of the previous blend SVG mascot.
- Auth buttons now use the mascot cutouts as small icon badges so the visual system stays consistent across the app.
- When the implementation changes, the working summary should be updated in this `.md` file so the current state stays visible in one place.

## Product vision

Build a polished personal platform that can gradually become Erik's public brand. It should begin as a web application usable privately on a MacBook and iPhone, then later be prepared for a public website and an App Store release.

The system should feel like one coherent product rather than several unrelated apps.

## Core product areas

### 1. Personal blog - primary backbone

- Public personal blog and brand homepage.
- Posts, essays, notes, stories, and personal updates.
- Categories, tags, drafts, publishing, and rich content.
- Attractive, distinctive, responsive presentation on desktop and mobile.
- SEO and sharing support when the product becomes public.

### 2. Calendar

- Display both Gregorian/solar dates (`duong lich`) and Vietnamese lunar dates (`am lich`).
- Include important annual solar and lunar events.
- Handle recurring events whose dates are based on either calendar system.
- Provide daily, monthly, and event-oriented views.

### 3. Events and reminders

- Create personal events and reminders.
- Support recurring annual events.
- Notify for system events and personal events.
- Future notification channels may include web push, email, and native iPhone notifications.
- Redis/job queues may later be used for reliable scheduled notifications.

### 4. Account, storage, and synchronization

- Login and secure authentication.
- Support email/password auth plus Google OAuth login/linking.
- Support logout and password reset/change-password flows sent by email.
- Persistent database storage.
- Synchronize user data between MacBook, iPhone, and future clients.
- Initially designed for a personal/single-user workflow, but should not block future multi-user support.

### 5. Future personal tools

- The architecture should allow new modules without restructuring the whole repository.
- Possible areas include notes, media, bookmarks, personal dashboards, and other everyday utilities.
- These are future modules, not part of the first implementation milestone.

## Initial platform scope

- First version: responsive web app used on Erik's MacBook and personal iPhone.
- It can initially run locally or on a private server.
- Later: deploy publicly and build/release a native or installable iPhone app through the App Store.
- Xcode is only needed when native iOS development begins; VS Code/Codex is appropriate for the current web/backend work.

## Proposed technical direction

Use one monorepo because the product is one brand ecosystem and the frontend, backend, shared contracts, and future clients will evolve together.

```text
erik-brand-new-day/
  FE/                 Next.js frontend
  BE/                 FastAPI backend
  README.md
  PROJECT_SCOPE_SUMMARY.md
```

Suggested stack:

- Frontend: Next.js + React + TypeScript.
- Backend: FastAPI + Python.
- Primary database: PostgreSQL.
- ORM/database toolkit: decide during initial scaffold; SQLAlchemy is a reasonable default for FastAPI.
- Cache and scheduled jobs: Redis.
- Local database setup: use a regular local PostgreSQL installation for development.
- Authentication: decide before implementing auth; it must support secure web sessions and future mobile clients.
- API contracts and common types: `packages/shared`.

Do not split frontend and backend into separate Git repositories at this stage.
Do not introduce extra top-level app/package folders beyond `FE/` and `BE/`.

## Local development goal

The repository should be clone-and-run with a small, documented command sequence:

```bash
cp .env.example .env
```

Expected local services:

- Web: `http://localhost:3000`
- API: `http://localhost:8000`
- PostgreSQL: local SQL installation
- Redis: Docker container

Secrets must not be committed. Provide `.env.example` and a correct `.gitignore`.

## Visual direction

- The interface should be polished, intentional, and personal rather than looking like a generic admin template.
- Blog and brand identity should lead the visual language.
- Responsive design is required for both iPhone and MacBook.
- Calendar and personal tools should inherit the same coherent brand system.
- Final typography, colors, logo, and detailed art direction have not yet been approved.

## Server and deployment direction

- Local development should use a regular PostgreSQL installation.
- A future private server should be able to deploy by cloning the repository and running documented Docker commands.
- SSH, production Docker configuration, domain, HTTPS, backups, and CI/CD still need to be designed.
- Do not provision or deploy a production server until the target machine/provider and security requirements are confirmed.

## Current repository state

- GitHub repository was created and cloned locally.
- Target repository: `/Users/eriklehnsher/Projects/personal_project/erik-brand-new-day`
- The workspace now uses a two-folder layout:
  - `FE/` for the frontend scaffold
  - `BE/` for the backend scaffold
- The implementation is being updated to a FastAPI backend with PostgreSQL support.

## Instructions for the next Codex task

Create the new task with this folder selected as the actual writable workspace:

`/Users/eriklehnsher/Projects/personal_project/erik-brand-new-day`

Then use this prompt:

> Read `PROJECT_SCOPE_SUMMARY.md` if it is present. Inspect the current repository first. Build the initial runnable repo skeleton directly in this workspace for Erik Brand New Day. The blog is the product backbone; calendar, lunar dates, events, reminders, login, storage, and synchronization are modules of the same personal brand platform. Use `FE/` for Next.js and `BE/` for FastAPI, add PostgreSQL with Docker Compose, preserve any existing files, do not overwrite unrelated work, create useful documentation and environment examples, install dependencies if allowed, and verify that the scaffold builds or clearly report anything that cannot be run.

## Recommended first milestone

1. Inspect the empty repository and Git status.
2. Create the monorepo structure and root tooling.
3. Create a branded responsive Next.js landing/blog shell.
4. Create a NestJS API with a health endpoint.
5. Add PostgreSQL and Redis through Docker Compose.
6. Add shared types and environment validation.
7. Add README setup instructions.
8. Install dependencies and verify lint, typecheck, build, API health, and web startup.

## Decisions still open

- Exact authentication provider/strategy.
- ORM choice and initial database schema.
- Blog editor and media storage approach.
- Lunar calendar conversion library and authoritative event data source.
- Reminder delivery channels for the first release.
- Native iOS versus React Native/Expo for the future App Store client.
- Hosting provider/server details, domain, backups, monitoring, and CI/CD.
- Final visual identity and brand assets.

These decisions should be made incrementally. They should not prevent creation of the initial runnable skeleton.
