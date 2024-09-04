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

RUN npm init -y

RUN npm install fs path minimist js-yaml axios

COPY ./gitops-checkout.js .

COPY ./build-deploy-action.js .

COPY ./status-update.sh .

RUN chmod +x status-update.sh
