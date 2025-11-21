FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY . .
# We use npm in this project, so we stick to npm
RUN npm install
RUN npx turbo run build --filter=api...
# Generate prisma client
WORKDIR /app/apps/api
RUN npx prisma generate

FROM base AS runner
WORKDIR /app
COPY --from=builder /app .
WORKDIR /app/apps/api
CMD ["node", "dist/index.js"]
