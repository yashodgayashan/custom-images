# Use an official Python image as a base
FROM python:3.9

# Install required tools: Git and Checkov
RUN apt-get update && apt-get install -y \
    git \
    && pip install checkov

# Create a directory for the application
WORKDIR /usr/src/app

# Create a script to run the commands
RUN echo '#!/bin/bash\n' \
    'SCAN_RESULT_DIR=$1\n' \
    'DOCKER_FILE_PATH=$2\n' \
    'rm -rf $SCAN_RESULT_DIR\n' \
    'mkdir -p $SCAN_RESULT_DIR\n' \
    'git rev-parse HEAD >> hash.txt\n' \
    'checkov -f $DOCKER_FILE_PATH --framework dockerfile --check CKV_DOCKER_3,CKV_DOCKER_8,CKV_CHOREO_1 -o json --quiet --external-checks-dir /path/to/custom-checkov-policy --output-file-path $SCAN_RESULT_DIR' \
    > /usr/src/app/run_checkov.sh

# Make the script executable
RUN chmod +x /usr/src/app/run_checkov.sh