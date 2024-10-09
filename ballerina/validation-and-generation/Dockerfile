FROM alpine:3.20

RUN apk update && \
    apk add --no-cache \
    curl=8.10.1-r0 \
    gnupg=2.4.5-r0 \
    lsb-release=12.0-r2 \
    wget=1.24.5-r0 \
    python3=3.12.7-r0 \
    py3-pip=24.0-r2 \
    nodejs=20.15.1-r0 \
    npm=10.8.0-r0 \
    podman=5.2.4-r0 \
    fuse-overlayfs=1.14-r0 \
    slirp4netns=1.2.3-r0 \
    && rm -rf /var/cache/apk/*

RUN npm install -g swagger-cli@4.0.4

WORKDIR /usr/src/app

RUN npm init -y && \
    npm install fs@0.0.1-security path@0.12.7 yup@0.32.11 js-yaml@4.1.0 minimist@1.2.6 axios@0.21.2 toml@3.0.0 json2toml@1.0.0

COPY ./enums.js .
COPY ./schemas.js .
COPY ./validate.js .
COPY ./config-generate-schema.js .
COPY ./configurable-generation-status-update.js .
COPY ./toml-parser.js .
COPY ./config-check.sh .

RUN chmod +x config-check.sh
