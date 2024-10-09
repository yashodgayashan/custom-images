FROM python:3.13-alpine

SHELL ["/bin/sh", "-o", "pipefail", "-c"]

RUN apk update && \
    apk add --no-cache \
    git=2.45.2-r0 \
    && rm -rf /var/cache/apk/*

RUN pip install --no-cache-dir checkov==2.0.0

WORKDIR /usr/src/app

COPY ./run_checkov.sh /usr/src/app/run_checkov.sh

RUN chmod +x /usr/src/app/run_checkov.sh
