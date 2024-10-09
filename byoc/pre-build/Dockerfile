FROM python:3.8-alpine

RUN apk update && \
    apk add --no-cache \
    git=2.45.2-r0 \
    build-base=0.5-r3 \
    libffi-dev=3.4.6-r0 \
    py3-cffi=1.16.0-r1 \
    && rm -rf /var/cache/apk/*

RUN pip install --upgrade pip

RUN pip install checkov==2.3.148

WORKDIR /usr/src/app

COPY ./run_checkov.sh /usr/src/app/run_checkov.sh
COPY ./custom-checkov-policy /usr/src/app/custom-checkov-policy

RUN chmod +x /usr/src/app/run_checkov.sh

