# Use an official Python image as a base
FROM python:3.9

# Install required tools: Podman and Trivy
RUN apt-get update && \
    apt-get install -y \
    software-properties-common \
    curl \
    gnupg2 \
    lsb-release \
    wget && \
    # Install Podman
    sh -c "echo 'deb http://download.opensuse.org/repositories/devel:/kubic:/libcontainers:/stable/$(lsb_release -cs)/ /' > /etc/apt/sources.list.d/devel:kubic:libcontainers:stable.list" && \
    wget -nv https://download.opensuse.org/repositories/devel:kubic:libcontainers:stable/$(lsb_release -cs)/Release.key -O Release.key && \
    apt-key add - < Release.key && \
    apt-get update && \
    apt-get -y install podman && \
    # Install Trivy
    wget https://github.com/aquasecurity/trivy/releases/download/v0.24.2/trivy_0.24.2_Linux-64bit.deb && \
    dpkg -i trivy_0.24.2_Linux-64bit.deb && \
    rm trivy_0.24.2_Linux-64bit.deb
