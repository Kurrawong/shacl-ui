ARG NODE_VERSION=20.18.0
ARG PNPM_VERSION=9.0.5
ARG PYTHON_VERSION=3.12

#
# JS
#
FROM node:${NODE_VERSION} AS js

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

RUN corepack enable && \
    corepack install --global pnpm@${PNPM_VERSION}

COPY js /app
WORKDIR /app
RUN rm -rf node_modules
RUN pnpm install
RUN pnpm run build-only

#
# PYTHON BUILD
#
FROM python:${PYTHON_VERSION}-alpine AS python-build

RUN apk update && \
    apk add --no-cache \
      gcc \
      libffi-dev \
      librdkafka-dev \
      musl-dev \
      python3-dev

COPY --from=ghcr.io/astral-sh/uv:0.4.18 /uv /bin/uv

ADD ./shui-server /app
WORKDIR /app
COPY --from=js /app/dist/index.js /app/src/shui/html/static/shui.js
COPY --from=js /app/dist/style.css /app/src/shui/html/static/shui.css
RUN uv sync --frozen --all-extras

#
# FINAL PYTHON
#
FROM python:${PYTHON_VERSION}-alpine

RUN apk update && \
    apk add --no-cache \
      bash \
      curl \
      librdkafka

RUN apk upgrade

COPY --from=python-build /app /app

WORKDIR /app
CMD ["./.venv/bin/uvicorn", "shui.app:app", "--host=0.0.0.0", "--port=8000", "--proxy-headers", "--forwarded-allow-ips=*"]
