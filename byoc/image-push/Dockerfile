FROM quay.io/podman/stable:latest

# Install necessary tools and dependencies
RUN dnf install -y nodejs npm && dnf clean all

WORKDIR /usr/src/app

RUN npm init -y

# Install the required dependencies
RUN npm install fs path minimist 

# Copy the source code to the app directory
COPY ./image-push.js .