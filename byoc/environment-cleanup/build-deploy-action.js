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
    const oasFilePath = args['oas-file-path'];
    const gitHashDate = args['git-hash-date'];
    const isAutoDeploy = args['is-auto-deploy'] === 'true';
    const runId = args['run-id'];
    const choreoApp = args['choreo-app'];

    console.log("domain: ", domain);
    console.log("organizationId: ", organizationId);
    console.log("projectId: ", projectId);
    console.log("appId: ", appId);
    console.log("envId: ", envId);
    console.log("api_version_id: ", api_version_id);
    console.log("imageName: ", imageName);
    console.log("gitHash: ", gitHash);
    console.log("gitOpsHash: ", gitOpsHash);
    console.log("token: ", token);
    console.log("debug: ", debug);
    console.log("isHttpBased: ", isHttpBased);
    console.log("portExtractFilePath: ", portExtractFilePath);
    console.log("containerId: ", containerId);
    console.log("isContainerDeployment: ", isContainerDeployment);
    console.log("oasFilePath: ", oasFilePath);
    console.log("gitHashDate: ", gitHashDate);
    console.log("isAutoDeploy: ", isAutoDeploy);
    console.log("runId: ", runId);
    console.log("choreoApp: ", choreoApp);

    process.env.REG_CRED_FILE_NAME = "registry-credentials";

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
        const fileContents = fileContents = fs.readFileSync(
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
        run_id: runId
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
        run_id: runId
    };

    let WebhookURL;
    if (body.registry_token && body.registry_token !== "") {
        WebhookURL = isContainerDeployment ? `${domain}/image/deploy-byoc` : `${domain}/image/deploy`;
    }
    if (debug) {
        console.log("request-body: ", JSON.stringify(body));
    }

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