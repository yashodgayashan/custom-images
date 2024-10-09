#!/bin/bash

# Copyright (c) 2024, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
#
# This software is the property of WSO2 LLC. and its suppliers, if any.
# Dissemination of any information or reproduction of any material contained
# herein is strictly forbidden, unless permitted by WSO2 in accordance with
# the WSO2 Commercial License available at http://wso2.com/licenses.
# For specific language governing the permissions and limitations under
# this license, please see the license as well as any agreement you’ve
# entered into with WSO2 governing the purchase of this software and any
# associated services.

SCAN_RESULT_DIR=$1
DOCKER_FILE_PATH=$2

rm -rf "$SCAN_RESULT_DIR"
mkdir -p "$SCAN_RESULT_DIR"

checkov -f "$DOCKER_FILE_PATH" --framework dockerfile --check CKV_DOCKER_3,CKV_DOCKER_8, CKV_CHOREO_1 -o json --quiet --external-checks-dir /path/to/custom-checkov-policy --output-file-path "$SCAN_RESULT_DIR"

CHECKOV_EXIT_CODE=$?
if [ $CHECKOV_EXIT_CODE -ne 0 ]; then
  echo "Checkov scan failed with exit code $CHECKOV_EXIT_CODE"
fi

echo "Copying scan results to /mnt/vol"
cp -r "$SCAN_RESULT_DIR" /mnt/vol
exit $CHECKOV_EXIT_CODE
