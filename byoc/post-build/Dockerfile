# Use Podman stable base image
FROM quay.io/podman/stable:latest

# Install necessary tools and dependencies
RUN dnf -y update && \
    dnf -y install \
    curl \
    git \
    bash \
    ca-certificates \
    && dnf clean all

# Install Trivy
RUN curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh

# Set the working directory
WORKDIR /app

# Default command to run when the container starts
CMD ["trivy", "--help"]