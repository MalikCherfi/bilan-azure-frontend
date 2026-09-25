# syntax=docker/dockerfile:1
# ──────────────────────────────────────────────────────────────────────────────
# Multi-stage build for the AKS track (piste "AKS", see helm/ and
# .github/workflows/aks-deploy.yml). swa-deploy.yml (Static Web Apps track)
# never uses this image.
#
# API_BASE_URL/API_KEY are baked in at build time via the same sed-into-
# environment.ts substitution swa-deploy.yml already does ("Inject prod
# environment values" step) -- Angular bundles environment.ts into the JS at
# build time either way, so there's no "runtime env var" option here without
# a bigger restructure (e.g. a config.json fetched at startup). Consequence:
# a URL/key change means a rebuild + redeploy, not just a new `helm upgrade
# --set`, same constraint that already exists for the Static Web App track.
# ──────────────────────────────────────────────────────────────────────────────


# ── Build stage ─────────────────────────────────────────────────────────────
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG API_BASE_URL

RUN --mount=type=secret,id=API_KEY \
    API_KEY_VAL=$(cat /run/secrets/API_KEY) && \
    test -n "$API_BASE_URL" && test -n "$API_KEY_VAL" || (echo "API_BASE_URL and API_KEY build secrets are required" && exit 1) && \
    sed -i "s#https://REPLACE_WITH_PROD_API_URL/api#${API_BASE_URL}#" src/environments/environment.ts && \
    sed -i "s/__BACKEND_API_KEY__/${API_KEY_VAL}/" src/environments/environment.ts

RUN npm run build:prod

# ── Runtime stage ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

RUN apk update && apk upgrade --no-cache

RUN mkdir -p /var/cache/nginx /var/run /tmp \
 && chown -R 10001:10001 /var/cache/nginx /var/run /tmp /usr/share/nginx/html /etc/nginx/conf.d

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/azure-quiz-frontend/browser /usr/share/nginx/html

USER 10001

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
