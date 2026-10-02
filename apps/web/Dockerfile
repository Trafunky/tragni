# syntax=docker/dockerfile:1

FROM node:24-alpine AS build
RUN corepack enable
WORKDIR /repo

# Manifests and the lock file first: this install layer stays cached until a
# dependency actually changes (Q7).
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY packages/api-client/package.json packages/api-client/

# The client package generates its types during install and needs the
# specification to do so — the reason it is committed (ADR-0013).
COPY apps/api/openapi/ apps/api/openapi/
COPY packages/api-client/ packages/api-client/

RUN pnpm install --frozen-lockfile

COPY apps/web/ apps/web/
RUN pnpm --filter web build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# `output: "standalone"` leaves a server plus exactly the dependencies it needs.
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static

# public/ is not part of the standalone output and has to be copied separately.
# A file missing here shows up only as a broken image in the browser — never as
# a failed build, because both the local build and CI read public/ straight from
# the working directory.
COPY --from=build /repo/apps/web/public ./apps/web/public

USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
