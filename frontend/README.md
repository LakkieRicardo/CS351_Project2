# Frontend

The frontend is a React application built with Vite. Its production build is a
set of static files in `dist/`; the Express API is deployed separately.

## Local development

From this directory, install dependencies and start the Vite development
server:

```sh
npm install
npm run dev
```

The frontend uses `http://localhost:5000` as the API URL by default during
local development. To override it, create `.env.local` with:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Deploying the static frontend

1. Deploy the Express backend and determine its public HTTPS origin, for
   example `https://your-backend-service.run.app`.
2. Set `VITE_API_BASE_URL` in `.env.production` to that origin. Do not add a
   trailing slash or `/api`; the frontend adds endpoint paths such as
   `/api/products` itself. Replace the example value already in that file with
   your actual backend URL.
3. Set `base` in `vite.config.js` to the URL path where the static site will be
   hosted. Use `/` when hosted at the domain root. For a subdirectory, use that
   path with leading and trailing slashes, such as `/shop/`. The current value
   is `/cs351.lakkie.net/project2/`; change it if your Google Cloud hosting
   path differs.
4. Configure the backend to allow requests from the exact frontend origin.
   The current CORS configuration only allows `http://localhost:5173`, so
   production requests will otherwise be blocked by the browser. The frontend
   origin is the scheme and hostname (and optional port), without a path.
5. Build the production files:

   ```sh
   npm ci
   npm run build
   ```

6. Upload the **contents of `dist/`** to your Google Cloud static hosting
   destination. The built files include the API URL configured at build time;
   changing `.env.production` requires rebuilding and redeploying them.

The login flow uses a session cookie. If the frontend and backend are on
different sites, configure the backend session cookie for cross-site HTTPS
(`SameSite=None` and `Secure`) and continue using credentialed CORS and
`credentials: 'include'` on requests that use the session.