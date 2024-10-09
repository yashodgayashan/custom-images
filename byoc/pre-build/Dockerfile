FROM python:3.13-alpine

SHELL ["/bin/sh", "-o", "pipefail", "-c"]

# Install git and remove apk cache
RUN apk update && \
    apk add --no-cache \
    git=2.45.2-r0 \
    && rm -rf /var/cache/apk/*

# Install checkov and the missing 'six' module
RUN pip install --no-cache-dir checkov==2.0.0 six=1.15.0

# Set the working directory
WORKDIR /usr/src/app

# Copy the run_checkov.sh script into the working directory
COPY ./run_checkov.sh /usr/src/app/run_checkov.sh

# Make the script executable
RUN chmod +x /usr/src/app/run_checkov.sh
