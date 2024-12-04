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

token=""
userOrgName=""
userRepoName=""
serverUrl=""
ref=""

usage() {
    echo "Usage: $0 [-t <token>] [-o <userOrgName>] [-r <userRepoName>] [-s <serverUrl>] [-f <ref>]"
    echo ""
    echo "Options:"
    echo "  -t, --token            GitLab OAuth token"
    echo "  -o, --userOrgName      GitLab organization or group name"
    echo "  -r, --userRepoName     GitLab repository name"
    echo "  -s, --serverUrl        GitLab server URL"
    echo "  -f, --ref              Git reference (branch/tag) to checkout"
    echo ""
    echo "Example:"
    echo "  $0 -t yourToken -o yourOrgName -r yourRepoName -g yourConfigRepoName -s yourServerUrl -f yourRef"
    exit 1
}

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -t|--token) token="$2"; shift ;;
        -o|--userOrgName) userOrgName="$2"; shift ;;
        -r|--userRepoName) userRepoName="$2"; shift ;;
        -s|--serverUrl) serverUrl="$2"; shift ;;
        -f|--ref) ref="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; usage ;;
    esac
    shift
done

if [[ -z "$token" || -z "$userOrgName" || -z "$userRepoName" || -z "$serverUrl" || -z "$ref" ]]; then
    echo "Error: Missing required parameters"
    usage
fi

urlWithoutProtocol=$(echo "$serverUrl" | sed -e 's/^https:\/\///')

handle_error() {
    echo "Error: $1"
    exit 1
}

git remote add origin "https://oauth2:${token}@${urlWithoutProtocol}/${userOrgName}/${userRepoName}.git" || handle_error "Failed to add git remote"
git -c protocol.version=2 fetch --no-tags --prune --progress --no-recurse-submodules origin || handle_error "Failed to fetch from git remote"
git checkout -b "${ref}" "${ref}" || handle_error "Failed to checkout branch ${ref}"
