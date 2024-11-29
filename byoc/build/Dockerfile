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
FROM alpine:3.20

# Install necessary tools (podman, fuse-overlayfs, slirp4netns) and clean up afterward
RUN apk update && \
    apk add --no-cache \
    podman=5.2.4-r0 \
    fuse-overlayfs=1.14-r0 \
    slirp4netns=1.2.3-r0 \
    nodejs=20.15.1-r0 \
    npm=10.8.0-r0 \
    && rm -rf /var/cache/apk/*


# Configure container registry search
RUN echo 'unqualified-search-registries = ["docker.io"]' > /etc/containers/registries.conf

WORKDIR /usr/src/app

COPY /prism-docker-resource-generator/* .
