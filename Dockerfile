# Build
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Runtime: production dependencies only, no toolchain, no source.
FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache tini

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY README.md SKILL.md LICENSE ./

# Page tokens live in the home directory, so it has to be a mounted volume or
# every login is written into a container that is about to disappear.
RUN mkdir -p /home/node/.facebook-mcp && chown -R node:node /home/node/.facebook-mcp
VOLUME ["/home/node/.facebook-mcp"]

USER node

# tini reaps zombies and forwards signals, so `docker stop` returns promptly
# rather than waiting out the grace period.
ENTRYPOINT ["/sbin/tini", "--", "node", "dist/index.js"]
