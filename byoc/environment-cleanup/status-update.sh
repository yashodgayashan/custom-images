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

# Default values
baseurl=""
componentId=""
trackId=""
workflowName=""
status=""
conclusion=""
token=""
gitOpsCommitSha=""

# Function to print usage
print_usage() {
    echo "Usage: $0 --baseurl=<baseurl> --componentId=<componentId> --trackId=<trackId> --workflowName=<workflowName> --status=<status> [--conclusion=<conclusion>] [--gitOpsCommitSha=<gitOpsCommitSha>] --token=<token>"
    exit 1
}

# Parse key-value arguments
while [ $# -gt 0 ]; do
  case $1 in
    --baseurl=*)
      baseurl="${1#*=}"
      ;;
    --componentId=*)
      componentId="${1#*=}"
      ;;
    --trackId=*)
      trackId="${1#*=}"
      ;;
    --workflowName=*)
      workflowName="${1#*=}"
      ;;
    --status=*)
      status="${1#*=}"
      ;;
    --conclusion=*)
      conclusion="${1#*=}"
      ;;
    --gitOpsCommitSha=*)
      gitOpsCommitSha="${1#*=}"
      ;;
    --token=*)
      token="${1#*=}"
      ;;
    *)
      echo "Invalid argument: $1"
      print_usage
      ;;
  esac
  shift
done

# Check if required inputs are provided
if [[ -z "$baseurl" || -z "$componentId" || -z "$trackId" || -z "$workflowName" || -z "$status" || -z "$token" ]]; then
    echo "Error: baseurl, componentId, trackId, workflowName, status, and token are required."
    print_usage
fi

# If conclusion is not provided, use an empty string
if [ -z "$conclusion" ]; then
    conclusion=""
fi

url="$baseurl/component-utils/1.0.0/actions/components/$componentId/deployment-tracks/$trackId/workflows/$workflowName/status"

if ! curl --location --request POST "$url" \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $token" \
--data-raw "{
    \"status\": \"$status\",
    \"conclusion\": \"$conclusion\",
    \"gitOpsCommitSha\": \"$gitOpsCommitSha\"}
}"; then
    echo -e "\nCurl request failed"
    exit 1
else
    echo -e "\nCurl request succeeded"
fi
