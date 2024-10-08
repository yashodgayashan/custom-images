FROM quay.io/podman/stable:v5.2

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN dnf -y update && \
    dnf -y install \
    curl-7.61.1-18.el8_4.1 \
    gnupg2-2.2.20-2.el8 \
    lsb-release-2.0.0-1.el8 \
    && dnf clean all

# Install pack CLI (Cloud Native Buildpacks CLI)
RUN curl -sSL "https://github.com/buildpacks/pack/releases/download/v0.34.2/pack-v0.34.2-linux.tgz" | tar -C /usr/local/bin -xzv pack

WORKDIR /usr/src/app