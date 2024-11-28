FROM alpine:3.20

RUN apk update && \
    apk add --no-cache \
    curl=8.11.0-r2 \
    gnupg=2.4.5-r0 \
    lsb-release=12.0-r2 \
    wget=1.24.5-r0 \
    python3=3.12.7-r0 \
    py3-pip=24.0-r2 \
    nodejs=20.15.1-r0 \
    npm=10.9.1-r0 \
    git=2.45.2-r0 \
    && rm -rf /var/cache/apk/*

RUN npm install -g swagger-cli@4.0.4

WORKDIR /usr/src/app

RUN npm init -y && \
    npm install fs@0.0.1-security path@0.12.7 minimist@1.2.6 js-yaml@4.1.0 axios@0.21.2

COPY ./gitops-checkout.js .
COPY ./build-deploy-action.js .
COPY ./status-update.sh .
COPY ./configurable-generation-status-update.js .

RUN chmod +x status-update.sh
