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

RUN npm install fs path yup js-yaml minimist axios toml json2toml

COPY ./enums.js .

COPY ./schemas.js .

COPY ./validate.js .

COPY ./config-generate-schema.js .

COPY ./configurable-generation-status-update.js .

COPY ./toml-parser.js .

COPY ./config-check.sh .

RUN chmod +x config-check.sh
