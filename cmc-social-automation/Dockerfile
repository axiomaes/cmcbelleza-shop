# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Forzar modo desarrollo en builder para asegurar instalación de tsc (devDependencies)
ENV NODE_ENV=development

COPY package*.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]
