FROM quay.io/podman/stable:latest

# Install necessary tools and dependencies
RUN dnf -y update && \
    dnf -y install \
    curl \
    gnupg2 \
    lsb-release \
    wget \
    python3-pip

RUN wget https://github.com/aquasecurity/trivy/releases/download/v0.24.2/trivy_0.24.2_Linux-ARM64.tar.gz && \
    tar -xzf trivy_0.24.2_Linux-ARM64.tar.gz -C /usr/local/bin trivy && \
    rm trivy_0.24.2_Linux-ARM64.tar.gz

WORKDIR /usr/src/app
