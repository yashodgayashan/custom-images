#!/bin/bash

# Check if the correct number of arguments are provided
if [ "$#" -ne 6 ]; then
    echo "Usage: $0 <baseurl> <componentId> <trackId> <workflowName> <status> <conclusion>"
    exit 1
fi

# Assign input arguments to variables
BASEURL=$1
COMPONENT_ID=$2
TRACK_ID=$3
WORKFLOW_NAME=$4
STATUS=$5
CONCLUSION=$6

# Construct the URL
URL="$BASEURL/component-utils/1.0.0/actions/components/$COMPONENT_ID/deployment-tracks/$TRACK_ID/workflows/$WORKFLOW_NAME/status"

# Run the curl command
curl --location --request POST "$URL" \
--header 'Content-Type: application/json' \
--data-raw "{
    \"status\": \"$STATUS\",
    \"conclusion\": \"$CONCLUSION\"
}"

# Check if the curl command succeeded
if [ $? -ne 0 ]; then
    echo -e "\nCurl request failed"
    exit 1
else
    echo -e "\nCurl request succeeded"
fi

# End of script
