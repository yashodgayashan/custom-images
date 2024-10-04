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

# Install pack CLI (Cloud Native Buildpacks CLI)
RUN curl -sSL "https://github.com/buildpacks/pack/releases/download/v0.34.2/pack-v0.34.2-linux.tgz" | tar -C /usr/local/bin -xzv pack

RUN pack version

# Set the working directory
WORKDIR /usr/src/app
