#!/bin/bash

SCAN_RESULT_DIR=""
DOCKER_FILE_PATH=""

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --scan-result-dir)
            SCAN_RESULT_DIR="$2"
            shift 2
            ;;
        --docker-file-path)
            DOCKER_FILE_PATH="$2"
            shift 2
            ;;
        *)
            echo "Unknown parameter: $1"
            exit 1
            ;;
    esac
done

if [[ -z "$SCAN_RESULT_DIR" || -z "$DOCKER_FILE_PATH" ]]; then
    echo "Error: --scan-result-dir and --docker-file-path are required."
    exit 1
fi

rm -rf "$SCAN_RESULT_DIR"
mkdir -p "$SCAN_RESULT_DIR"

checkov -f "$DOCKER_FILE_PATH" --framework dockerfile --check CKV_DOCKER_3,CKV_DOCKER_8,CKV_CHOREO_1 -o json --quiet --external-checks-dir ./custom-checkov-policy --output-file-path "$SCAN_RESULT_DIR"

CHECKOV_EXIT_CODE=$?
if [ $CHECKOV_EXIT_CODE -ne 0 ]; then
  echo "Checkov scan failed with exit code $CHECKOV_EXIT_CODE"
fi

echo "Copying scan results to /mnt/vol"
cp -r "$SCAN_RESULT_DIR" /mnt/vol

exit $CHECKOV_EXIT_CODE
