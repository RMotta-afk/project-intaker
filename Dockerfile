FROM node:22-bookworm-slim AS base

# Prisma's SQLite engine needs OpenSSL; HTTPS calls need trusted CA certificates.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

FROM base AS build
ENV HUSKY=0
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Prisma generate and Next build need a defined URL, but create no runtime database.
ENV DATABASE_URL=file:./build.db
RUN npm run db:generate \
    && npm run build \
    && npm prune --omit=dev \
    && npm run db:generate

FROM base AS runtime
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URL=file:/data/intakes.db \
    WORKER_ADAPTER_MODULE=./src/ai/provider/generate.ts

RUN mkdir -p /data /app/.next && chown -R node:node /data /app
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/next.config.ts ./next.config.ts
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/src ./src
COPY --from=build --chown=node:node /app/scripts/start-container.mjs ./scripts/start-container.mjs
COPY --from=build --chown=node:node /app/scripts/healthcheck.mjs ./scripts/healthcheck.mjs

USER node
VOLUME ["/data"]
EXPOSE 3000
STOPSIGNAL SIGTERM
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD ["node", "scripts/healthcheck.mjs"]
CMD ["node", "scripts/start-container.mjs"]
