FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/client/package*.json ./
RUN npm ci
COPY frontend/client/ ./
RUN npm run build -- --mode production --base=/ --outDir /app/static --emptyOutDir

FROM node:22-alpine

ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app/backend

COPY backend/server/package*.json ./
RUN npm ci --omit=dev
COPY backend/server/ ./
COPY --from=frontend-build /app/static /app/static

EXPOSE 8080
CMD ["node", "server.js"]
