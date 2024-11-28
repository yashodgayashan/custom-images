FROM alpine:3.20

SHELL ["/bin/ash", "-o", "pipefail", "-c"]

RUN apk update && \
    apk add --no-cache \
    curl=8.11.0-r2 \
    gnupg=2.4.5-r0 \
    podman=5.2.5-r0 \
    fuse-overlayfs=1.14-r0 \
    slirp4netns=1.2.3-r0 \
    lsb-release=12.0-r2 \
    nodejs=20.15.1-r0 \
    npm=10.9.1-r0 \
    && rm -rf /var/cache/apk/*

RUN curl -sSL "https://github.com/buildpacks/pack/releases/download/v0.35.1/pack-v0.35.1-linux.tgz" | tar -C /usr/local/bin -xzv pack

WORKDIR /usr/src/app

COPY generate_webhook_openapi.sh .
COPY generate_webhook_openapi.js .

RUN chmod +x generate_webhook_openapi.sh
