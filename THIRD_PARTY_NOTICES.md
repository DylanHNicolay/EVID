# Third-party open source acknowledgments

This software incorporates or depends on third-party open source projects. Dependency manifests live in:

| Area | Manifest | Installed packages |
|------|----------|-------------------|
| React client | [`divecloud-react/package.json`](divecloud-react/package.json) | `divecloud-react/node_modules/` |
| HTTP API | [`api/package.json`](api/package.json) | `api/node_modules/` |
| Root (types only) | [`package.json`](package.json) | `node_modules/` at repo root, if present |

After `npm install`, **every package** under `node_modules/` includes its own license file or SPDX metadata. This file lists **direct** dependencies declared in this repository and their SPDX license identifiers as published on the npm registry (run `npm view <package> license` to confirm current values).

**Transitive dependencies** (dependencies of dependencies) are numerous. To list all production packages and licenses locally:

```bash
cd divecloud-react && npx license-checker@25 --production --csv
cd ../api && npx license-checker@25 --production --csv
```

---

## Frontend application (`divecloud-react/`)

| Package | License | Home / source |
|---------|---------|----------------|
| [react](https://www.npmjs.com/package/react) | MIT | [facebook/react](https://github.com/facebook/react) |
| [react-dom](https://www.npmjs.com/package/react-dom) | MIT | [facebook/react](https://github.com/facebook/react) |
| [react-router-dom](https://www.npmjs.com/package/react-router-dom) | MIT | [remix-run/react-router](https://github.com/remix-run/react-router) |
| [react-scripts](https://www.npmjs.com/package/react-scripts) (Create React App toolchain) | MIT | [facebook/create-react-app](https://github.com/facebook/create-react-app) |
| [typescript](https://www.npmjs.com/package/typescript) | Apache-2.0 | [microsoft/TypeScript](https://github.com/microsoft/TypeScript) |
| [web-vitals](https://www.npmjs.com/package/web-vitals) | Apache-2.0 | [GoogleChrome/web-vitals](https://github.com/GoogleChrome/web-vitals) |
| [yaml](https://www.npmjs.com/package/yaml) | ISC | [eemeli/yaml](https://github.com/eemeli/yaml) |
| [@testing-library/dom](https://www.npmjs.com/package/@testing-library/dom) | MIT | [testing-library/dom-testing-library](https://github.com/testing-library/dom-testing-library) |
| [@testing-library/jest-dom](https://www.npmjs.com/package/@testing-library/jest-dom) | MIT | [testing-library/jest-dom](https://github.com/testing-library/jest-dom) |
| [@testing-library/react](https://www.npmjs.com/package/@testing-library/react) | MIT | [testing-library/react-testing-library](https://github.com/testing-library/react-testing-library) |
| [@testing-library/user-event](https://www.npmjs.com/package/@testing-library/user-event) | MIT | [testing-library/user-event](https://github.com/testing-library/user-event) |
| [@types/jest](https://www.npmjs.com/package/@types/jest) | MIT | [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| [@types/node](https://www.npmjs.com/package/@types/node) | MIT | [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| [@types/react](https://www.npmjs.com/package/@types/react) | MIT | [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| [@types/react-dom](https://www.npmjs.com/package/@types/react-dom) | MIT | [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) |

The project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app); see also [`divecloud-react/README.md`](divecloud-react/README.md).

### Development and quality tools (client)

| Package | License | Home / source |
|---------|---------|----------------|
| [eslint-config-prettier](https://www.npmjs.com/package/eslint-config-prettier) | MIT | [prettier/eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) |
| [husky](https://www.npmjs.com/package/husky) | MIT | [typicode/husky](https://github.com/typicode/husky) |
| [lint-staged](https://www.npmjs.com/package/lint-staged) | MIT | [lint-staged/lint-staged](https://github.com/lint-staged/lint-staged) |
| [prettier](https://www.npmjs.com/package/prettier) | MIT | [prettier/prettier](https://github.com/prettier/prettier) |

ESLint and related packages are pulled in transitively by `react-scripts`; their licenses appear under `node_modules/` when dependencies are installed.

---

## Backend API (`api/`)

| Package | License | Home / source |
|---------|---------|----------------|
| [bcryptjs](https://www.npmjs.com/package/bcryptjs) | BSD-3-Clause | [dcodeIO/bcrypt.js](https://github.com/dcodeIO/bcrypt.js) |
| [cors](https://www.npmjs.com/package/cors) | MIT | [expressjs/cors](https://github.com/expressjs/cors) |
| [express](https://www.npmjs.com/package/express) | MIT | [expressjs/express](https://github.com/expressjs/express) |
| [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) | MIT | [auth0/node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) |
| [pg](https://www.npmjs.com/package/pg) (node-postgres) | MIT | [brianc/node-postgres](https://github.com/brianc/node-postgres) |

---

## Containers and base images

Defined in [`docker-compose.yml`](docker-compose.yml) and the Dockerfiles under [`api/Dockerfile`](api/Dockerfile) and [`divecloud-react/Dockerfile`](divecloud-react/Dockerfile):

| Image | Purpose |
|-------|---------|
| [postgres:18-alpine](https://hub.docker.com/_/postgres) | Database server |
| [node:18-alpine](https://hub.docker.com/_/node) | React app container (see `divecloud-react/Dockerfile`) |
| [node:20-alpine](https://hub.docker.com/_/node) | API container (see `api/Dockerfile`) |

Licensing and notices for these images and for the software they contain are maintained by the respective projects (Docker Official Images, PostgreSQL Global Development Group, OpenJS Foundation / Node.js, and Alpine Linux).

---

## Other references in this repository

- [Node.js](https://nodejs.org/) is required to run npm scripts and the API locally. See the [Node.js license](https://github.com/nodejs/node/blob/main/LICENSE) in the Node.js project.
- [Docker](https://www.docker.com/) / [Docker Compose](https://docs.docker.com/compose/) are used to run the stack; see [Docker’s license terms](https://www.docker.com/legal/) for the tooling itself.

If you redistribute a production build, review all obligations in the licenses above (including attribution, copy of license text, and “NOTICE” requirements where applicable) for both direct and transitive dependencies.
