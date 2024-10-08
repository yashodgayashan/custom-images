FROM quay.io/podman/stable:latest

# Install necessary tools and dependencies
RUN dnf -y update && \
    dnf -y install \
    curl-8.6.0 \
    gnupg2-2.4.4\
    # lsb-release-40 \
    && dnf clean all

# Install pack CLI (Cloud Native Buildpacks CLI)
RUN curl -sSL "https://github.com/buildpacks/pack/releases/download/v0.34.2/pack-v0.34.2-linux.tgz" | tar -C /usr/local/bin -xzv pack

# Set the working directory
WORKDIR /usr/src/app
