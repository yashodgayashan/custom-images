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
username=""
userOrgName=""
userRepoName=""
ref=""

usage() {
    echo "Usage: $0 [-t <token>] [-u <username>] [-o <userOrgName>] [-r <userRepoName>] [-f <ref>]"
    echo ""
    echo "Options:"
    echo "  -t, --token            Bitbucket token"
    echo "  -u, --username         Bitbucket username"
    echo "  -o, --userOrgName      Organization name in Bitbucket"
    echo "  -r, --userRepoName     Repository name in Bitbucket"
    echo "  -f, --ref              Git reference (branch/tag) to checkout"
    echo ""
    echo "Example:"
    echo "  $0 -t yourToken -u yourUsername -o yourOrgName -r yourRepoName -f yourRef"
    exit 1
}

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -t|--token) token="$2"; shift ;;
        -u|--username) username="$2"; shift ;;
        -o|--userOrgName) userOrgName="$2"; shift ;;
        -r|--userRepoName) userRepoName="$2"; shift ;;
        -f|--ref) ref="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; usage ;;
    esac
    shift
done

if [[ -z "$token" || -z "$username" || -z "$userOrgName" || -z "$userRepoName" || -z "$ref" ]]; then
    echo "Error: Missing required parameters"
    usage
fi

handle_error() {
    echo "Error: $1"
    exit 1
}

echo "Checking out branch ${ref} from Bitbucket repository ${userOrgName}/${userRepoName}..."

echo "Adding git remote..."

echo "Username: ${username}"
echo "Token: ${token}"

mkdir -p ${userRepoName}
cd ${userRepoName} || handle_error "Failed to change directory to ${userRepoName}"
git init || handle_error "Failed to initialize git repository"
git remote add origin "https://${username}:${token}@bitbucket.org/${userOrgName}/${userRepoName}.git" || handle_error "Failed to add git remote"

echo "Fetching from git remote..."
git -c protocol.version=2 fetch --no-tags --prune --progress --no-recurse-submodules origin || handle_error "Failed to fetch from git remote"

echo "Checking out branch ${ref}..."
git checkout -b "${ref}" "${ref}" || handle_error "Failed to checkout branch ${ref}"
