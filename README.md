# EVID

## Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [Docker](https://www.docker.com/) & Docker Compose

## Getting Started

### 1. Install dependencies

```bash
cd divecloud-react
npm install
```

This automatically runs the `prepare` script, which sets up [Husky](https://typicode.github.io/husky/) git hooks. No extra setup is needed.

### 2. Start the application

```bash
# From the project root
docker compose up --build
```

This starts:
- **React app** at [http://localhost:3000](http://localhost:3000)
- **PostgreSQL** at `localhost:5432`
- **pgAdmin** at [http://localhost:5050](http://localhost:5050)

## Open source and third-party software

Dependencies are declared in `divecloud-react/package.json`, `api/package.json`, and the root `package.json`. A summary of direct npm packages, container images, and how to list full **transitive** license information is in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md). The client app was bootstrapped with [Create React App](https://github.com/facebook/create-react-app); see [`divecloud-react/README.md`](divecloud-react/README.md) for the upstream project’s own notice.

## Code Quality

This project uses **Prettier** for formatting and **ESLint** for linting, enforced via **Husky** git hooks and **lint-staged**.

### Available scripts

All scripts run from `divecloud-react/`:

| Script | Description |
|--------|-------------|
| `npm run format` | Auto-format all source files with Prettier |
| `npm run format:check` | Check formatting without writing changes |
| `npm run lint` | Run ESLint with zero warnings allowed |
| `npm run lint:fix` | Run ESLint and auto-fix what it can |
| `npm run typecheck` | Run strict TypeScript compile checks without emitting files |

### Git hooks

Hooks are installed automatically when you run `npm install` inside `divecloud-react/`.

| Hook | Trigger | What it runs |
|------|---------|--------------|
| `pre-commit` | Every `git commit` | Runs Prettier and ESLint (with auto-fix) via `lint-staged` on staged `.js`, `.jsx`, `.ts`, `.tsx`, `.json`, `.css`, `.md` files |
| `pre-push` | Every `git push` | Runs `format:check`, `lint`, then `typecheck` across all source files |

If formatting or linting fails, the commit or push is **blocked** until the issues are fixed.

### Manual setup (if hooks aren't active)

If you cloned the repo and the hooks aren't firing, run:

```bash
cd divecloud-react
npm run prepare
```

This configures git to use the hooks in `divecloud-react/.husky/`.

### Bypassing hooks (not recommended)

In rare cases where you need to skip the hooks:

```bash
git commit --no-verify -m "your message"
git push --no-verify
```

## CI -- GitHub Actions

A **Lint** workflow (`.github/workflows/lint.yml`) runs on every push to `main` and on every pull request targeting `main`. It:

1. Checks out the code
2. Sets up Node.js 20 with npm caching
3. Installs dependencies (`npm ci`)
4. Checks Prettier formatting (`npm run format:check`)
5. Runs ESLint (`npm run lint`)
6. Runs TypeScript type checks (`npm run typecheck`)

If either check fails, the workflow fails and the PR shows a red check. To make this a hard gate, enable **branch protection** on `main`:

1. Go to **Settings > Branches > Branch protection rules**
2. Add a rule for `main`
3. Check **Require status checks to pass before merging**
4. Search for and select the **ESLint** status check
5. Optionally check **Require branches to be up to date before merging**

This ensures no code can be merged into `main` without passing formatting and linting checks, even if someone bypasses local hooks.