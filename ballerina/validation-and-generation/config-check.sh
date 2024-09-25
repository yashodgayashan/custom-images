#!/bin/bash

# Parse the --base-path argument
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --base-path) BASE_PATH="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

# Check if base path argument is provided
if [ -z "$BASE_PATH" ]; then
  echo "Usage: $0 --base-path <base-path>"
  exit 1
fi

# Define the paths to the source config files relative to the base path
COMPONENT_YAML_PATH="$BASE_PATH/.choreo/component.yaml"
COMPONENT_CONFIG_YAML_PATH="$BASE_PATH/.choreo/component-config.yaml"
ENDPOINTS_YAML_PATH="$BASE_PATH/.choreo/endpoints.yaml"

# Check for the existence of files and output the variables as export statements
if [ -f "$COMPONENT_YAML_PATH" ]; then
    echo "export hasSrcConfigFile=true"
    echo "export hasComponentYaml=true"
    echo "export srcConfigFileType=component.yaml"
elif [ -f "$COMPONENT_CONFIG_YAML_PATH" ]; then
    echo "export hasSrcConfigFile=true"
    echo "export hasComponentYaml=false"
    echo "export srcConfigFileType=component-config.yaml"
elif [ -f "$ENDPOINTS_YAML_PATH" ]; then
    echo "export hasSrcConfigFile=true"
    echo "export hasComponentYaml=false"
    echo "export srcConfigFileType=endpoints.yaml"
else
    echo "export hasSrcConfigFile=false"
    echo "export hasComponentYaml=false"
    echo "export srcConfigFileType="
fi
