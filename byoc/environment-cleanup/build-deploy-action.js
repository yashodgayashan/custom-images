const axios = require('axios').default;
const fs = require('fs');
const yaml = require('js-yaml');
const minimist = require('minimist');

// Function to display usage
function usage() {
    console.log(`Usage: node script.js --domain <domain> --org-id <org-id> --project-id <project-id> --app-id <app-id> --choreo-app <choreo-app> --env-id <env-id> --version <version> --image-name <image-name> --git-hash <git-hash> --gitops-hash <gitops-hash> --token <token> --debug <debug> --is-http-based <is-http-based> --port-extract-file-path <port-extract-file-path> --container-id <container-id> --is-container-deployment <is-container-deployment> --oas-file-path <oas-file-path> --git-hash-date <git-hash-date> --is-auto-deploy <is-auto-deploy> --run-id <run-id>`);
    process.exit(1);
}

// Parsing command-line arguments
const args = minimist(process.argv.slice(2));

args['is-http-based'] = args['is-http-based'] !== undefined ? args['is-http-based'] : true;
args['is-container-deployment'] = args['is-container-deployment'] !== undefined ? args['is-container-deployment'] : false;
args['port-extract-file-path'] = args['port-extract-file-path'] !== undefined ? args['port-extract-file-path'] : 'target/kubernetes/workspace/workspace.yaml';

args['git-hash-date'] = args['git-hash-date'] || new Date().toISOString();


if (!args['domain'] || !args['org-id'] || !args['project-id'] || !args['app-id'] || !args['env-id'] || !args['version'] || !args['image-name'] || !args['git-hash'] || !args['gitops-hash'] || !args['token'] || !args['is-http-based'] || !args['port-extract-file-path'] || !args['is-container-deployment'] || !args['oas-file-path'] || !args['git-hash-date'] || !args['is-auto-deploy'] || !args['run-id'] || !args['choreo-app']) {
    if (!args['domain']) {
        console.error("Missing required parameter: domain");
    }
    if (!args['org-id']) {
        console.error("Missing required parameter: org-id");
    }
    if (!args['project-id']) {
        console.error("Missing required parameter: project-id");
    }
    if (!args['app-id']) {
        console.error("Missing required parameter: app-id");
    }
    if (!args['env-id']) {
        console.error("Missing required parameter: env-id");
    }
    if (!args['version']) {
        console.error("Missing required parameter: version");
    }
    if (!args['image-name']) {
        console.error("Missing required parameter: image-name");
    }
    if (!args['git-hash']) {
        console.error("Missing required parameter: git-hash");
    }
    if (!args['gitops-hash']) {
        console.error("Missing required parameter: gitops-hash");
    }
    if (!args['token']) {
        console.error("Missing required parameter: token");
    }
    if (!args['is-http-based']) {
        console.error("Missing required parameter: is-http-based");
    }
    if (!args['port-extract-file-path']) {
        console.error("Missing required parameter: port-extract-file-path");
    }
    if (!args['is-container-deployment']) {
        console.error("Missing required parameter: is-container-deployment");
    }
    if (!args['oas-file-path']) {
        console.error("Missing required parameter: oas-file-path");
    }
    if (!args['git-hash-date']) {
        console.error("Missing required parameter: git-hash-date");
    }
    if (!args['is-auto-deploy']) {
        console.error("Missing required parameter: is-auto-deploy");
    }
    if (!args['run-id']) {
        console.error("Missing required parameter: run-id");
    }
    if (!args['choreo-app']) {
        console.error("Missing required parameter: choreo-app");
    }
    
    usage();
}

function getPreparedPath(path) {
    var separatedPaths = path.split("/");
    separatedPaths[separatedPaths.length - 1] = separatedPaths[separatedPaths.length - 1].toLowerCase();
    return separatedPaths.join("/");
}

try {
    const extractedPorts = [];
    const domain = args['domain'];
    const organizationId = args['org-id'];
    const projectId = args['project-id'];
    const appId = args['app-id'];
    const envId = args['env-id'];
    const api_version_id = args['version'];
    const imageName = args['image-name'];
    const gitHash = args['git-hash'];
    const gitOpsHash = args['gitops-hash'];
    const token = args['token'];
    const debug = args['debug'];
    const isHttpBased = args['is-http-based'];
    const portExtractFilePath = args['port-extract-file-path'];
    const containerId = args['container-id'];
    const isContainerDeployment = args['is-container-deployment'];
    let oasFilePath = args['oas-file-path'];
    // if oasFilePath is true then set empty string
    if (oasFilePath == true) {
        oasFilePath = '';
    }
    const gitHashDate = args['git-hash-date'];
    const isAutoDeploy = args['is-auto-deploy'] === 'true';
    const runId = args['run-id'];
    const choreoApp = args['choreo-app'];
    const registryCredFileName = args['registry-cred-file-name'];

    process.env.REG_CRED_FILE_NAME = registryCredFileName || "registry-credentials";

    let cluster_image_tags = [];
    let preparedPortExtractFilePath = getPreparedPath(portExtractFilePath);
    if (!isContainerDeployment) {
        try {
            let fileContents = "";
            try {
                fileContents = fs.readFileSync(portExtractFilePath, 'utf8');
                preparedPortExtractFilePath = portExtractFilePath;
            } catch (error) {
                console.log("Checking other file format path: ", preparedPortExtractFilePath);
                fileContents = fs.readFileSync(preparedPortExtractFilePath, 'utf8');
            }
            let data = yaml.loadAll(fileContents);

            for (const file of data) {
                if (file.kind === 'Service') {
                    for (const port of file.spec.ports) {
                        extractedPorts.push({
                            port: port.port,
                            name: port.name
                        });
                    }
                }
            }
            if (extractedPorts.length === 0 && isHttpBased) {
                extractedPorts.push({
                    port: 8090,
                    name: "port-1-default"
                });
            }
        } catch (e) {
            console.log(e);
        }
    }

    try {
        const fileContents = fs.readFileSync(
            `/mnt/secrets/${process.env.REG_CRED_FILE_NAME}`,
            "utf8"
          );
        let data = JSON.parse(fileContents);
        for (const cred of data) {
            // We add docker hub docker login to increase the image pull rate limit and this registry id is added as a choreo-docker-hub
            // so we skip the docker push for this registry
            if (cred.registry_id === "choreo-docker-hub") {
                continue;
            }
            cluster_image_tags.push({
                registry_id: cred.registry_id,
                clusters: cred.clusters,
                image_name_with_tag: `${cred.credentials.registry}/${choreoApp}:${gitHash}`
            });
        }
    } catch (error) {
        console.log(`Failed to load ${process.env.REG_CRED_FILE_NAME} file: `, error);
    }

    console.log(`Sending Request to Choreo API....`);
    const body = isContainerDeployment ? {
        image: imageName,
        tag: gitHash,
        git_hash: gitHash,
        gitops_hash: gitOpsHash,
        app_id: appId,
        api_version_id: api_version_id,
        environment_id: envId,
        registry_token: token,
        container_id: containerId,
        api_definition_path: oasFilePath,
        cluster_image_tags,
        git_hash_commit_timestamp: gitHashDate,
        is_auto_deploy: isAutoDeploy,
        run_id: runId.toString()
    } : {
        image: imageName,
        tag: gitHash,
        image_ports: extractedPorts,
        git_hash: gitHash,
        gitops_hash: gitOpsHash,
        organization_id: organizationId,
        project_id: projectId,
        app_id: appId,
        api_version_id: api_version_id,
        environment_id: envId,
        registry_token: token,
        workspace_yaml_path: preparedPortExtractFilePath,
        cluster_image_tags,
        git_hash_commit_timestamp: gitHashDate,
        is_auto_deploy: isAutoDeploy,
        run_id: runId.toString()
    };

    let WebhookURL;
    if (body.registry_token && body.registry_token !== "") {
        WebhookURL = isContainerDeployment ? `${domain}/image/deploy-byoc` : `${domain}/image/deploy`;
    }
    if (debug) {
        console.log("request-body: ", JSON.stringify(body));
    }

    console.log("WebhookURL: ", WebhookURL);
    console.log("request-body: ", JSON.stringify(body));

    axios.post(WebhookURL, body).then(function (response) {
        console.log("choreo-status", "deployed");
    }).catch(function (error) {
        if (error.response) {
            console.error(error.response.data);
            console.log(error.response.status);
        } else if (error.request) {
            console.log(error.request);
        } else {
            console.log('Error', error.message);
        }
    });

} catch (error) {
    console.error("choreo-status", "failed");
    console.log(error.message);
}
