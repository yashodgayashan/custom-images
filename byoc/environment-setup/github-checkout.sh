#!/bin/bash

# Function to display usage
usage() {
    echo "Usage: $0 -t <git-pat> -r <repo-name> -b <branch-name> [-s <commit-sha>] [-d <clone-destination>] [-u] [-R]"
    echo "  -t <git-pat>             : Personal Access Token for GitHub"
    echo "  -r <repo-name>           : Repository name in the format 'username/repo'"
    echo "  -b <branch-name>         : Branch to checkout"
    echo "  -s <commit-sha>          : (Optional) Specific commit SHA to checkout"
    echo "  -d <clone-destination>   : (Optional) Directory to clone into"
    echo "  -u                       : Fetch full history (unshallow)"
    echo "  -R                       : Perform recursive checkout"
    exit 1
}

# Parse command line arguments
while getopts "t:r:b:s:d:uR" opt; do
    case ${opt} in
        t)
            GIT_PAT=${OPTARG}
            ;;
        r)
            REPO_NAME=${OPTARG}
            ;;
        b)
            BRANCH_NAME=${OPTARG}
            ;;
        s)
            COMMIT_SHA=${OPTARG}
            ;;
        d)
            CLONE_DESTINATION=${OPTARG}
            ;;
        u)
            UNSHALLOW=true
            ;;
        R)
            RECURSIVE=true
            ;;
        *)
            usage
            ;;
    esac
done

# Check if mandatory parameters are provided
if [ -z "${GIT_PAT}" ] || [ -z "${REPO_NAME}" ] || [ -z "${BRANCH_NAME}" ]; then
    usage
fi

# If no clone destination is provided, use the repo name as the directory
if [ -z "${CLONE_DESTINATION}" ]; then
    CLONE_DESTINATION=$(basename ${REPO_NAME})
fi

# Construct the repository URL using the PAT
REPO_URL="https://${GIT_PAT}@github.com/${REPO_NAME}.git"

# Clone the repository as a shallow clone
git clone --depth 1 --branch ${BRANCH_NAME} ${REPO_URL} ${CLONE_DESTINATION}
cd ${CLONE_DESTINATION} || { echo "Failed to enter the directory ${CLONE_DESTINATION}"; exit 1; }

# Fetch the full history if requested
if [ "${UNSHALLOW}" = true ]; then
    git fetch --unshallow || { echo "Failed to fetch full history"; exit 1; }
fi

# Check out the specified commit SHA if provided
if [ -n "${COMMIT_SHA}" ]; then
    git fetch origin ${COMMIT_SHA} || { echo "Failed to fetch the specified commit SHA"; exit 1; }
    git checkout ${COMMIT_SHA} || { echo "Failed to checkout to commit SHA ${COMMIT_SHA}"; exit 1; }
else
    # Check out to the specified branch
    git checkout ${BRANCH_NAME} || { echo "Failed to checkout to branch ${BRANCH_NAME}"; exit 1; }
fi

# Perform a recursive checkout if requested
if [ "${RECURSIVE}" = true ]; then
    git submodule update --init --recursive || { echo "Failed to perform recursive checkout"; exit 1; }
fi

echo "Repository cloned and checked out to branch ${BRANCH_NAME} successfully."
if [ -n "${COMMIT_SHA}" ]; then
    echo "Checked out to commit SHA ${COMMIT_SHA}."
fi
