#!/bin/bash

# Default values
baseurl=""
componentId=""
trackId=""
workflowName=""
status=""
conclusion=""
token=""

# Function to print usage
print_usage() {
    echo "Usage: $0 --baseurl=<baseurl> --componentId=<componentId> --trackId=<trackId> --workflowName=<workflowName> --status=<status> [--conclusion=<conclusion>] --token=<token>"
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

# Construct the URL
url="$baseurl/component-utils/1.0.0/actions/components/$componentId/deployment-tracks/$trackId/workflows/$workflowName/status"

# Run the curl command with the token
curl --location --request POST "$url" \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $token" \
--data-raw "{
    \"status\": \"$status\",
    \"conclusion\": \"$conclusion\"
}"

# Check if the curl command succeeded
if [ $? -ne 0 ]; then
    echo -e "\nCurl request failed"
    exit 1
else
    echo -e "\nCurl request succeeded"
fi
