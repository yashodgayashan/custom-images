FROM node:22-alpine

RUN apk update && \
    apk add --no-cache \
    git=2.45.2-r0 \
    curl=8.10.1-r0 \
    && rm -rf /var/cache/apk/*

WORKDIR /usr/src/app

RUN npm init -y && \
    npm install axios@0.21.2

COPY ./script.js ./github-checkout.sh ./status-update.sh ./bitbucket-checkout.sh ./gitlab-server-checkout.sh ./

RUN chmod +x github-checkout.sh status-update.sh bitbucket-checkout.sh gitlab-server-checkout.sh



