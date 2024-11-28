/*
 * Copyright (c) 2024, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

const axios = require("axios").default;
const fs = require("fs");
const yaml = require("js-yaml");
const minimist = require("minimist");

function usage() {
  console.log(
    `Usage: node script.js --domain <domain> --org-id <org-id> --project-id <project-id> --app-id <app-id> --choreo-app <choreo-app> --env-id <env-id> --version <version> --image-name <image-name> --git-hash <git-hash> --gitops-hash <gitops-hash> --token <token> --debug <debug> --is-http-based <is-http-based> --port-extract-file-path <port-extract-file-path> --container-id <container-id> --is-container-deployment <is-container-deployment> --oas-file-path <oas-file-path> --git-hash-date <git-hash-date> --is-auto-deploy <is-auto-deploy> --run-id <run-id>`
  );
  process.exit(1);
}

function readInput() {
  const args = minimist(process.argv.slice(2));

  args["is-http-based"] =
    args["is-http-based"] !== undefined ? args["is-http-based"] : true;
  args["is-container-deployment"] =
    args["is-container-deployment"] !== undefined
      ? args["is-container-deployment"]
      : false;
  args["port-extract-file-path"] =
    args["port-extract-file-path"] !== undefined
      ? args["port-extract-file-path"]
      : "target/kubernetes/workspace/workspace.yaml";
  args["git-hash-date"] = args["git-hash-date"] || new Date().toISOString();

  const requiredArgs = [
    "domain",
    "org-id",
    "project-id",
    "app-id",
    "env-id",
    "version",
    "image-name",
    "git-hash",
    "gitops-hash",
    "token",
    "is-http-based",
    "port-extract-file-path",
    "git-hash-date",
    "is-auto-deploy",
    "run-id",
    "choreo-app",
  ];

  requiredArgs.forEach((arg) => {
    if (!args[arg]) {
      console.error(`Missing required parameter: ${arg}`);
      usage();
    }
  });

  return args;
}

function getPreparedPath(path) {
  const separatedPaths = path.split("/");
  separatedPaths[separatedPaths.length - 1] =
    separatedPaths[separatedPaths.length - 1].toLowerCase();
  return separatedPaths.join("/");
}

async function main() {
  try {
    const args = readInput();

    const extractedPorts = [];
    const preparedPortExtractFilePath = getPreparedPath(
      args["port-extract-file-path"]
    );

    if (!args["is-container-deployment"]) {
      try {
        const fileContents = fs.readFileSync(
          preparedPortExtractFilePath,
          "utf8"
        );
        const data = yaml.loadAll(fileContents);

        data.forEach((file) => {
          if (file.kind === "Service") {
            file.spec.ports.forEach((port) => {
              extractedPorts.push({
                port: port.port,
                name: port.name,
              });
            });
          }
        });

        if (extractedPorts.length === 0 && args["is-http-based"]) {
          extractedPorts.push({
            port: 8090,
            name: "port-1-default",
          });
        }
      } catch (error) {
        console.error("Error reading port extract file:", error);
      }
    }

    let cluster_image_tags = [];
    try {
      const fileContents = fs.readFileSync(
        `/mnt/secrets/${
          process.env.REG_CRED_FILE_NAME || "registry-credentials"
        }`,
        "utf8"
      );
      const data = JSON.parse(fileContents);

      data.forEach((cred) => {
        if (cred.registry_id !== "choreo-docker-hub") {
          cluster_image_tags.push({
            registry_id: cred.registry_id,
            clusters: cred.clusters,
            image_name_with_tag: `${cred.credentials.registry}/${args["choreo-app"]}:${args["git-hash"]}`,
          });
        }
      });
    } catch (error) {
      console.error(`Failed to load registry credentials: ${error}`);
    }

    console.log("is-container-deployment", args["is-container-deployment"]);
    const body = args["is-container-deployment"] === true
      ? {
          image: args["image-name"],
          tag: args["git-hash"],
          git_hash: args["git-hash"],
          gitops_hash: args["gitops-hash"],
          app_id: args["app-id"],
          api_version_id: args["version"],
          environment_id: args["env-id"],
          registry_token: args["token"],
          container_id: args["container-id"],
          api_definition_path: typeof args["oas-file-path"] === "string" && args["oas-file-path"].trim() !== "" ? args["oas-file-path"] : null,
          cluster_image_tags,
          git_hash_commit_timestamp: args["git-hash-date"],
          is_auto_deploy: args["is-auto-deploy"] === "true",
          run_id: args["run-id"].toString(),
        }
      : {
          image: args["image-name"],
          tag: args["git-hash"],
          image_ports: extractedPorts,
          git_hash: args["git-hash"],
          gitops_hash: args["gitops-hash"],
          organization_id: args["org-id"],
          project_id: args["project-id"],
          app_id: args["app-id"],
          api_version_id: args["version"],
          environment_id: args["env-id"],
          registry_token: args["token"],
          workspace_yaml_path: preparedPortExtractFilePath,
          cluster_image_tags,
          git_hash_commit_timestamp: args["git-hash-date"],
          is_auto_deploy: args["is-auto-deploy"] === "true",
          run_id: args["run-id"].toString(),
        };

    console.log(body)
    const webhookURL = args["is-container-deployment"] === true
      ? `${args["domain"]}/image/deploy-byoc`
      : `${args["domain"]}/image/deploy`;
    if (args["token"]) {
      if (args["debug"]) {
        console.log("Request body:", JSON.stringify(body, null, 2));
      }
      console.log("webhookURL", webhookURL);

      try {
        await axios.post(webhookURL, body);
        console.log("choreo-status", "deployed");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            console.error("Error response:", error.response.data);
          } else if (error.request) {
            console.error("No response received:", error.request);
          }
        } else {
          console.error("Unexpected error:", error.message);
        }
        process.exit(1);
      }
    }
  } catch (error) {
    console.error("choreo-status", "failed", error.message);
    process.exit(1);
  }
}

main();
