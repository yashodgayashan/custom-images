FROM alpine:3.20

SHELL ["/bin/ash", "-o", "pipefail", "-c"]

RUN apk update && \
    apk add --no-cache \
    curl=8.10.1-r0 \
    gnupg=2.4.5-r0 \
    podman=5.2.4-r0 \
    fuse-overlayfs=1.14-r0 \
    slirp4netns=1.2.3-r0 \
    lsb-release=12.0-r2 \
    && rm -rf /var/cache/apk/*

RUN curl -sSL "https://github.com/buildpacks/pack/releases/download/v0.35.1/pack-v0.35.1-linux.tgz" | tar -C /usr/local/bin -xzv pack

WORKDIR /usr/src/app