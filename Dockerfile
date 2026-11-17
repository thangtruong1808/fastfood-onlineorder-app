# Build the Vite app, then serve the static files with Nginx.
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY public ./public
COPY src ./src

# Vite reads these at build time and bakes them into the JS bundle.
ARG VITE_PAYMENT_ADAPTER=mock
ARG VITE_STRIPE_PUBLISHABLE_KEY=
ENV VITE_PAYMENT_ADAPTER=$VITE_PAYMENT_ADAPTER
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY

RUN npm run build

FROM nginx:1.27-alpine

RUN apk add --no-cache wget

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
