FROM quay.io/podman/stable:latest

# Install necessary tools and dependencies
RUN dnf -y update && \
    dnf -y install \
    curl \
    gnupg2 \
    lsb-release \
    wget \
    python3-pip \
    nodejs \
    npm \
    git \
    && dnf clean all

RUN npm install -g swagger-cli

WORKDIR /usr/src/app


