#!/bin/bash

# Function to show usage
usage() {
  echo "Usage: $0 --template <template> --buildpack-language <language>"
  exit 1
}

# Parse command-line arguments
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --template) TEMPLATE="$2"; shift ;;
    --buildpack-language) BUILDPACK_LANGUAGE="$2"; shift ;;
    *) echo "Unknown parameter passed: $1"; usage ;;
  esac
  shift
done

# Validate inputs
if [[ -z "$TEMPLATE" || -z "$BUILDPACK_LANGUAGE" ]]; then
  echo "Error: Both --template and --buildpack-language are required."
  usage
fi

# Condition to check TEMPLATE and BUILDPACK_LANGUAGE
if [[ "$TEMPLATE" == "webhook" || ("$TEMPLATE" == "buildpackWebhook" && "$BUILDPACK_LANGUAGE" == "ballerina") ]]; then
  # Remove existing files
  rm -rf swagger/service_openapi.yaml
  rm -rf swagger/ignore_openapi.yaml

  # Generate the webhook OpenAPI file
  echo 'b3BlbmFwaTogMy4wLjEKaW5mbzoKICB0aXRsZTogV2ViaG9vayBPcGVuYXBpIFlhbWwKICB2ZXJzaW9uOiAxLjAuMAp4LXdzbzItZGlzYWJsZS1zZWN1cml0eTogdHJ1ZQpzZXJ2ZXJzOgogIC0gdXJsOiAie3NlcnZlcn06e3BvcnR9IgogICAgdmFyaWFibGVzOgogICAgICBzZXJ2ZXI6CiAgICAgICAgZGVmYXVsdDogaHR0cDovL2xvY2FsaG9zdAogICAgICBwb3J0OgogICAgICAgIGRlZmF1bHQ6ICI4MDkwIgpwYXRoczoKICAvOgogICAgcG9zdDoKICAgICAgc3VtbWFyeTogIiIKICAgICAgb3BlcmF0aW9uSWQ6IG9wZXJhdGlvbl9wb3N0Xy8KICAgICAgcmVzcG9uc2VzOgogICAgICAgICIyMDAiOgogICAgICAgICAgZGVzY3JpcHRpb246IE9rCiAgICAgICAgICBjb250ZW50OgogICAgICAgICAgICB0ZXh0L3BsYWluOgogICAgICAgICAgICAgIHNjaGVtYToKICAgICAgICAgICAgICAgIHR5cGU6IHN0cmluZwogICAgICAgICI1MDAiOgogICAgICAgICAgZGVzY3JpcHRpb246IEZvdW5kIHVuZXhwZWN0ZWQgb3V0cHV0CiAgICBnZXQ6CiAgICAgIHN1bW1hcnk6ICIiCiAgICAgIG9wZXJhdGlvbklkOiBvcGVyYXRpb25fZ2V0Xy8KICAgICAgcmVzcG9uc2VzOgogICAgICAgICIyMDIiOgogICAgICAgICAgZGVzY3JpcHRpb246IE9rCiAgICAgICAgICBjb250ZW50OgogICAgICAgICAgICB0ZXh0L3BsYWluOgogICAgICAgICAgICAgIHNjaGVtYToKICAgICAgICAgICAgICAgIHR5cGU6IHN0cmluZwogICAgICAgICI1MDAiOgogICAgICAgICAgZGVzY3JpcHRpb246IEZvdW5kIHVuZXhwZWN0ZWQgb3V0cHV0CmNvbXBvbmVudHM6IHt9Cg==' | base64 --decode > swagger/webhook_openapi.yaml
else
  echo "Condition not met. Exiting."
fi
