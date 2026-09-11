# Colmena Web

React frontend for the Colmena document management system — document routing between teams, response tracking, and status dashboards.

## Tech Stack

- **Framework**: React 19 (Vite)
- **Routing**: React Router
- **HTTP client**: Axios
- **Charts**: Chart.js (via react-chartjs-2)
- **Styling**: CSS Modules

## Getting Started

### Prerequisites

- Node.js 22+
- [colmena-api](../colmena-api) running locally or deployed

### Installation

\`\`\`bash
npm install
\`\`\`

### Environment variables

Copy `.env.example` to `.env`:

\`\`\`
VITE_API_URL=http://localhost:4000/api
\`\`\`

Point this to your backend's URL (local or deployed).

### Running the app

\`\`\`bash
npm run dev
\`\`\`

App runs on `http://localhost:5173` by default.

### Building for production

\`\`\`bash
npm run build
\`\`\`

Output goes to `dist/`.

## Project Structure

\`\`\`
src/
├── api/           # API calls, grouped by resource (auth, documents, catalogs, dashboard)
├── components/     # Reusable components (Layout, RoutingForm)
├── context/         # AuthContext (session state)
├── pages/           # Route-level views
└── App.jsx          # Route definitions
\`\`\`

## Authentication

- Access token held in memory (not `localStorage`), attached to requests via an axios interceptor
- Refresh token lives in an httpOnly cookie, set and read automatically by the backend
- On app load, the session is silently restored via `/auth/refresh` + `/auth/me`

## Pages

| Route | Description | Access |
|---|---|---|
| `/login` | Login form | Public |
| `/` | Welcome/home page | Authenticated |
| `/documents` | List of all documents | Authenticated |
| `/documents/new` | Create a document (file upload) | Authenticated |
| `/documents/:id` | Document detail: routing, response, cancel | Authenticated |
| `/dashboard` | Global stats (admin) or team-scoped stats (team member) | Authenticated |

## Styling

CSS Modules, co-located with each component (`Component.jsx` + `Component.module.css`). No global design system yet — styling is applied incrementally per page.

## Known Limitations

- No automated tests
- No pagination on the documents list
- No client-side form validation beyond HTML5 `required`/`type` attributes

## Branching Strategy

- `main` — stable, deployable code
- `develop` — integration branch
- `feature/*` — one branch per module, merged into `develop` via pull request
