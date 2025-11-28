FROM node:18-alpine AS base

# 1. Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/tta-1/package.json ./apps/tta-1/
COPY packages ./packages

# We need to copy all package.json files from packages to install dependencies correctly
# This is a simplification; for a strict prune we would use turbo prune
# But since we don't have turbo installed globally in the image yet, we'll try a simpler approach first
# or better, use the official turbo prune guide approach if possible.
# Given the complexity of manually copying, let's use the turbo prune approach if we can,
# but 'turbo prune' requires turbo to be installed.

# Let's try the standard TurboRepo Dockerfile approach:
# https://turbo.build/repo/docs/handbook/deploying-with-docker

# Re-starting with the Pruner stage
FROM base AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
COPY . .
RUN pnpm dlx turbo prune tta-1 --docker

# 2. Install dependencies (new stage)
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy pruned lockfile and package.json's
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
# Copy pnpm-workspace.yaml if it exists in root (it does)
COPY pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

# 3. Build the app
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM
# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

RUN pnpm turbo run build --filter=tta-1...

# 4. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/tta-1/public ./apps/tta-1/public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/tta-1/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/tta-1/.next/static ./apps/tta-1/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/tta-1/server.js"]
