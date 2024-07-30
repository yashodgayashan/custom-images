FROM quay.io/podman/stable:latest

# Install necessary tools and dependencies
RUN dnf -y update && \
    dnf -y install \
    curl \
    gnupg2 \
    lsb-release \
    wget \
    python3-pip && \
    # Install Trivy
    wget https://github.com/aquasecurity/trivy/releases/download/v0.24.2/trivy_0.24.2_Linux-64bit.rpm && \
    rpm -ivh trivy_0.24.2_Linux-64bit.rpm && \
    rm trivy_0.24.2_Linux-64bit.rpm