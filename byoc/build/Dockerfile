# Stage 1: Build environment (Debian/Ubuntu as an example)
# FROM ubuntu:latest AS builder

# # Update package lists and install required packages
# RUN apt-get update && apt-get install -y software-properties-common

# # Update package lists and install pack
# RUN add-apt-repository ppa:cncf-buildpacks/pack-cli
# RUN apt-get update
# RUN apt-get install pack-cli

# FROM quay.io/podman/stable:latest

# COPY --from=builder /usr/bin/pack /usr/bin/pack

# # Set unqualified search registry (optional)
# RUN echo 'unqualified-search-registries = ["docker.io"]' > /etc/containers/registries.conf

# # Install necessary packages for rootless Podman
# RUN dnf install -y fuse-overlayfs slirp4netns 

# WORKDIR /usr/src/app
FROM alpine:3.18

# Install necessary packages (fuse-overlayfs, slirp4netns) and configure Podman
RUN apk update && \
    apk add --no-cache \
    fuse-overlayfs \
    slirp4netns \
    podman \
    && rm -rf /var/cache/apk/*

# Configure container registry search in registries.conf
RUN echo 'unqualified-search-registries = ["docker.io"]' > /etc/containers/registries.conf

WORKDIR /usr/src/app
