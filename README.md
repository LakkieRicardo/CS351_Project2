# CS-351 Project 2

A React/Vite storefront served by an Express API, designed to deploy as one
service on Google Cloud Run. The root `Dockerfile` builds the frontend and
packages it with the backend; Express serves the static site and `/api`
endpoints from the same origin.

## Deploy from a connected repository

1. Push this repository to GitHub.
2. In Google Cloud Console, open **Cloud Run** and create a service using the
   continuous deployment/source repository option. Connect the GitHub
   repository (through Cloud Build or the repository connection flow), then
   select the branch to deploy.
3. Configure the build to use the repository's root `Dockerfile`.
4. Configure the service runtime environment:
   - Set `MONGODB_URI` to the database connection string.
   - Set `SESSION_SECRET` to a secure random value.
   - Store both values in Secret Manager and expose them as service secrets;
     do not commit credentials to the repository.
   - Cloud Run provides `PORT`; the container listens on port `8080`.
5. If the storefront should be publicly available, allow unauthenticated
   requests, then create the service.

Each deployment builds the Vite frontend and installs only the backend's
production dependencies in the container. The frontend calls `/api` on the
same origin, so no production API URL configuration is needed. You can
override the API URL for local development in
`frontend/client/.env.local`.

The backend connects to the `CS351Project2` MongoDB database. Make sure the
Cloud Run service can reach your MongoDB deployment and that its network access
rules permit the connection.

## Local development

### Backend

From `backend/server`, install dependencies and provide a local `.env` file
with the required settings:

```env
MONGODB_URI=<MongoDB connection URL>
PORT=5000
SESSION_SECRET=<secure local session secret>
```

Then start Express:

```powershell
npm ci
npm start
```

### Frontend

From `frontend/client`, install dependencies and create `.env.local` to point
the Vite development server at the local backend:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Then start Vite:

```powershell
npm ci
npm run dev
```

The root `deploy.ps1` script is available for local packaging and starts the
packaged server. Cloud Run builds directly from the connected repository using
the root `Dockerfile`.
