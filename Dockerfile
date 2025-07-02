ARG NODE_VERSION="22.12.0"
ARG NODE_ENV=development

# ============================== Base ============================== #
FROM node:${NODE_VERSION}-alpine AS base
ENV TZ=Asia/Bangkok

FROM base AS deps
ENV TZ=Asia/Bangkok
RUN apk -U upgrade && apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY ./package.json ./yarn.lock* ./package-lock.json* ./pnpm-lock.yaml* ./.npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ============================== Build ============================== #
FROM base AS builder
ENV TZ=Asia/Bangkok
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY ./ .

COPY api.${NODE_ENV}.env .env
# RUN npm run build
RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ============================== Runner ============================== #
FROM base AS runner
ENV TZ=Asia/Bangkok
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/. ./
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs
# COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD HOSTNAME="0.0.0.0" npm start