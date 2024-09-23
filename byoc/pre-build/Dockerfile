# Use an official Python image as a base
FROM python:3.9

# Install required tools: Git and Checkov
RUN apt-get update && apt-get install -y \
    git\
    && pip install checkov

# Create a directory for the application
WORKDIR /usr/src/app

# Create a script to run the commands
RUN echo '#!/bin/bash\n' \
    'SCAN_RESULT_DIR=$1\n' \
    'DOCKER_FILE_PATH=$2\n' \
    'rm -rf $SCAN_RESULT_DIR\n' \
    'mkdir -p $SCAN_RESULT_DIR\n' \
    'checkov -f $DOCKER_FILE_PATH --framework dockerfile --check CKV_DOCKER_3,CKV_DOCKER_8,CKV_CHOREO_1 -o json --quiet --external-checks-dir /path/to/custom-checkov-policy --output-file-path $SCAN_RESULT_DIR\n' \
    'CHECKOV_EXIT_CODE=$?\n' \
    'cp -r /usr/src/app/$SCAN_RESULT_DIR /mnt/vol' \
    'if [ $CHECKOV_EXIT_CODE -ne 0 ]; then\n' \
    '  echo "Checkov scan failed with exit code $CHECKOV_EXIT_CODE"\n' \
    '  exit 1\n' \
    'fi' \
    > /usr/src/app/run_checkov.sh

# Make the script executable
RUN chmod +x /usr/src/app/run_checkov.sh