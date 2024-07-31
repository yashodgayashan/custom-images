# Use the official Node.js image from the Docker Hub
FROM node:14

# Install git
RUN apt-get update && apt-get install -y git nano

# Create and change to the app directory
WORKDIR /usr/src/app

RUN npm init -y

# Install the required dependencies
RUN npm install axios

# Copy the source code to the app directory
COPY ./script.js .

RUN cd ..

COPY ./github-checkout.sh .

RUN chmod +x github-checkout.sh
