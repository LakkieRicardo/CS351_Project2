# Frontend and backend on Google Cloud Run

The storefront and Express API run together as a single Cloud Run service. A
Cloud Run revision contains one container and serves both the Vite-built site
and the `/api` endpoints from the same origin.

## Repository deployment flow

1. A commit is pushed to the GitHub branch connected to Cloud Run.
2. The connected Cloud Build pipeline builds the root `Dockerfile`.
3. The Dockerfile builds the frontend, then packages its static output with the
   Express backend and its production dependencies.
4. Cloud Run starts the image as a new service revision.

## Container layout

The Dockerfile uses two Node.js build stages:

- **Frontend build stage:** installs `frontend/client` dependencies and runs
  the Vite production build with `/` as its base path.
- **Runtime stage:** installs production dependencies from `backend/server`,
  copies the backend into `/app/backend`, and copies the built frontend into
  `/app/static`.

The backend resolves its static directory as the sibling `static/` folder.
Express serves those files and falls back to `index.html` for frontend routes.
The existing API route handlers stay under `/api`; API requests and static
content therefore share the Cloud Run service and origin.

## Runtime configuration

Cloud Run provides `PORT` for the HTTP server; the container listens on port
`8080` by default. Configure `MONGODB_URI` and `SESSION_SECRET` as runtime
secrets in Secret Manager, not as files or values committed to Git.

For a single-host `mongodb://` URI that does not contain a port, set
`MONGODB_PORT` to the MongoDB port. If omitted, MongoDB's standard port is
used. Do not set `MONGODB_PORT` when the URI already contains its port or uses
`mongodb+srv://`.

The backend connects to the `CS351Project2` database. Ensure the Cloud Run
service can reach the MongoDB host and that the database's network rules allow
the connection.

## Local development

Local development remains separate: run Express from `backend/server` and
Vite from `frontend/client`. The frontend's `.env.local` can set
`VITE_API_BASE_URL=http://localhost:5000` to point Vite at the local backend.
The root `deploy.ps1` is a local packaging helper; Cloud Run builds from the
repository using the root Dockerfile.
