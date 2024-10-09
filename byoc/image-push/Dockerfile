FROM alpine:3.20

RUN apk update && \
    apk add --no-cache \
    nodejs=20.15.1-r0 \
    npm=10.8.0-r0 \
    podman=5.2.4-r0 \
    fuse-overlayfs=1.14-r0 \
    slirp4netns=1.2.3-r0 \
    && rm -rf /var/cache/apk/*

WORKDIR /usr/src/app

RUN npm init -y && \
    npm install fs@0.0.1-security path@0.12.7 minimist@1.2.6

COPY ./image-push.js .