const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const minimist = require("minimist");

// Parse command-line arguments
const args = minimist(process.argv.slice(2), {
  string: ["type", "choreoApp", "regCredFileName", "imageName", "sha"],
  alias: { t: "type", c: "choreoApp", f: "regCredFileName", i: "imageName", s: "sha" },
  unknown: (arg) => {
    console.error(`Unknown option: ${arg}`);
    process.exit(1);
  },
});

// Set default values if not provided
const type = args.type || "login_and_push";
const regCredFileName = args.regCredFileName || "registry-credentials";
const imageName = args.imageName || "choreo/app-image:latest";
const sha = args.sha;  // Provide a sensible default or handle as needed

const choreoApp = args.choreoApp;

// Validate required parameters
if (!choreoApp || !sha ) {
  console.error(
    "Missing required parameters. Usage: node image-push.js --type <type> --choreoApp <choreoApp> --regCredFileName <regCredFileName> --imageName <imageName> --sha <sha>"
  );
  process.exit(1);
}

// Set environment variables
process.env.CHOREO_GITOPS_REPO = choreoApp;
process.env.REG_CRED_FILE_NAME = regCredFileName;
process.env.DOCKER_TEMP_IMAGE = imageName;
process.env.NEW_SHA = sha;
process.env.RUNNER_TEMP = "/tmp";

async function run() {
  switch (type) {
    case "login_and_push":
      await login_and_push();
      break;
    case "login":
      await login();
      break;
    default:
      console.error(`Unknown type: ${type}`);
      process.exit(1);
  }
}

async function login_and_push() {
  try {
    const fileContents = fs.readFileSync(
      `/mnt/secrets/${process.env.REG_CRED_FILE_NAME}`,
      "utf8"
    );
    let data = JSON.parse(fileContents);
    for (const cred of data) {
      console.log(cred);
      if (cred.type == "ACR") {
        await acrLogin(cred);
        await dockerPush(cred);
      }
      if (cred.type == "ECR") {
        await ecrLoginPrivate(cred);
        await dockerPush(cred);
      }
      if (cred.type == "GCP") {
        await setupGcpArtifactRegistry(cred);
      }
      if (cred.type == "DOCKER_HUB") {
        await dockerHubLogin(cred);
        await dockerPush(cred);
      }
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

async function login() {
  try {
    const fileContents = fs.readFileSync(
      `/mnt/secrets/${process.env.REG_CRED_FILE_NAME}`,
      "utf8"
    );
    let data = JSON.parse(fileContents);
    for (const cred of data) {
      if (
        (cred?.is_cdp === undefined || cred?.is_cdp) &&
        cred.registry_id != "choreo-docker-hub"
      ) {
        continue;
      }
      if (cred.type == "ACR") {
        await acrLogin(cred);
      }
      if (cred.type == "ECR") {
        await ecrLoginPrivate(cred);
      }
      if (cred.type == "GCP") {
        await gcpArtifactRegistryLogin(cred);
      }
      if (cred.type == "DOCKER_HUB") {
        await dockerHubLogin(cred);
      }
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

async function ecrLoginPrivate(cred) {
  const username = cred.credentials.registryUser;
  const password = cred.credentials.registryPassword;
  const region = cred.credentials.region;
  const registry = cred.credentials.registry;

  var child = spawn(
    `aws configure set aws_access_key_id ${username} && aws configure set aws_secret_access_key ${password} && aws configure set default.region ${region} && aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin ${registry} && aws ecr describe-repositories --repository-names ${choreoApp} || aws ecr create-repository --image-scanning-configuration scanOnPush=true --repository-name ${choreoApp}`,
    {
      shell: true,
    }
  );
  var data = "";
  for await (const chunk of child.stdout) {
    console.log("stdout chunk: " + chunk);
    data += chunk;
  }
  var error = "";
  for await (const chunk of child.stderr) {
    console.error("stderr chunk: " + chunk);
    error += chunk;
  }
  const exitCode = await new Promise((resolve, reject) => {
    child.on("close", resolve);
  });

  if (exitCode) {
    throw new Error(`subprocess error exit ${exitCode}, ${error}`);
  }
  return data;
}

// Deprecated: Please implement this feature
async function ecrLoginPublic(cred) {
  const username = cred.credentials.registryUser;
  const password = cred.credentials.registryPassword;
  const region = cred.credentials.region;

  var child = spawn(
    `aws configure set aws_access_key_id ${username} && aws configure set aws_secret_access_key ${password} && aws configure set default.region ${region} && aws ecr-public get-login-password --region ${region} | docker login --username AWS --password-stdin public.ecr.aws && aws ecr-public describe-repositories --repository-names ${choreoApp} || aws ecr-public create-repository --repository-name ${choreoApp}`,
    {
      shell: true,
    }
  );
  var data = "";
  for await (const chunk of child.stdout) {
    console.log("stdout chunk: " + chunk);
    data += chunk;
  }
  var error = "";
  for await (const chunk of child.stderr) {
    console.error("stderr chunk: " + chunk);
    error += chunk;
  }
  const exitCode = await new Promise((resolve, reject) => {
    child.on("close", resolve);
  });

  if (exitCode) {
    throw new Error(`subprocess error exit ${exitCode}, ${error}`);
  }
  return data;
}

async function dockerHubLogin(cred) {
  try {
    const username = cred.credentials.registryUser;
    const password = cred.credentials.registryPassword;
    let loginServer = "https://index.docker.io/v1/";
    if (!cred.credentials.registry.includes("docker.io")) {
      loginServer = cred.credentials.registry;
    }
    const authenticationToken = Buffer.from(`${username}:${password}`).toString(
      "base64"
    );
    let config;
    const runnerTempDirectory = process.env["RUNNER_TEMP"];
    const dirPath =
      process.env["DOCKER_CONFIG"] ||
      path.join(runnerTempDirectory, `docker_login_${Date.now()}`);
    await fs.promises.mkdir(dirPath, { recursive: true });
    const dockerConfigPath = path.join(dirPath, `config.json`);
    if (fs.existsSync(dockerConfigPath)) {
      try {
        config = JSON.parse(fs.readFileSync(dockerConfigPath, "utf8"));
        if (!config.auths) {
          config.auths = {};
        }
        config.auths[loginServer] = { auth: authenticationToken };
      } catch (err) {
        config = undefined;
      }
    }
    if (!config) {
      config = {
        auths: {
          [loginServer]: {
            auth: authenticationToken,
          },
        },
      };
    }
    console.debug(`Writing docker config contents to ${dockerConfigPath}`);
    fs.writeFileSync(dockerConfigPath, JSON.stringify(config));
    process.env["DOCKER_CONFIG"] = dirPath;
    console.log("DOCKER_CONFIG environment variable is set");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

async function gcpArtifactRegistryLogin(cred) {
  const registryPassword = cred.credentials.registryPassword;
  const keyContex = Buffer.from(registryPassword, "base64").toString();
  const region = cred.credentials.region;
  const registry = cred.credentials.registry;
  const repository = cred.credentials.repository;
  const projectId = JSON.parse(keyContex)["project_id"];
  const newImageTag = `${region}-docker.pkg.dev/${projectId}/${repository}/${choreoApp}:${process.env.NEW_SHA}`;
  const keyPath = "gcp-key.json";

  fs.writeFileSync(keyPath, keyContex, "utf-8");
  var child = spawn(
    `
    cat ${keyPath} | podman login -u _json_key --password-stdin ${registry} && \
    rm -rf gcp-key.json`,
    {
      shell: true,
    }
  );
  var data = "";
  for await (const chunk of child.stdout) {
    console.log(chunk.toString());
    data += chunk;
  }
  var error = "";
  for await (const chunk of child.stderr) {
    console.error(chunk.toString());
    error += chunk;
  }
  const exitCode = await new Promise((resolve, reject) => {
    child.on("close", resolve);
  });

  if (exitCode) {
    throw new Error(`subprocess error exit ${exitCode}, ${error}`);
  }
  return data;
}

async function acrLogin(cred) {
  try {
    const username = cred.credentials.registryUser;
    const password = cred.credentials.registryPassword;
    const loginServer = cred.credentials.registry;
    const authenticationToken = Buffer.from(`${username}:${password}`).toString(
      "base64"
    );
    let config;
    const runnerTempDirectory = process.env["RUNNER_TEMP"];
    const dirPath =
      process.env["DOCKER_CONFIG"] ||
      path.join(runnerTempDirectory, `docker_login_${Date.now()}`);
    await fs.promises.mkdir(dirPath, { recursive: true });
    const dockerConfigPath = path.join(dirPath, `config.json`);
    if (fs.existsSync(dockerConfigPath)) {
      try {
        config = JSON.parse(fs.readFileSync(dockerConfigPath, "utf8"));
        if (!config.auths) {
          config.auths = {};
        }
        config.auths[loginServer] = { auth: authenticationToken };
      } catch (err) {
        config = undefined;
      }
    }
    if (!config) {
      config = {
        auths: {
          [loginServer]: {
            auth: authenticationToken,
          },
        },
      };
    }
    console.debug(`Writing docker config contents to ${dockerConfigPath}`);
    fs.writeFileSync(dockerConfigPath, JSON.stringify(config));
    process.env["DOCKER_CONFIG"] = dirPath;
    console.log("DOCKER_CONFIG environment variable is set");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

async function dockerPush(cred) {
  // We do a docker login to increase the image pull rate limit and this registry id is added as a choreo-docker-hub
  // so we skip the docker push for this registry
  if (cred.registry_id == "choreo-docker-hub") {
    return;
  }
  const tempImage = process.env.DOCKER_TEMP_IMAGE;
  const registryUrl = cred.credentials.registry;
  const newImageTag = `${registryUrl}/${choreoApp}:${process.env.NEW_SHA}`;
  // Pushing images to Registry
  var child = spawn(
    `podman image tag ${tempImage} ${newImageTag} && podman push ${newImageTag} && podman logout ${registryUrl}`,
    {
      shell: true,
    }
  );
  var data = "";
  for await (const chunk of child.stdout) {
    console.log("stdout chunk: " + chunk);
    data += chunk;
  }
  var error = "";
  for await (const chunk of child.stderr) {
    console.error("stderr chunk: " + chunk);
    error += chunk;
  }
  const exitCode = await new Promise((resolve, reject) => {
    child.on("close", resolve);
  });

  if (exitCode) {
    throw new Error(`subprocess error exit ${exitCode}, ${error}`);
  }
  return data;
}

async function setupGcpArtifactRegistry(cred) {
  const registryPassword = cred.credentials.registryPassword;
  const keyContex = Buffer.from(registryPassword, "base64").toString();
  const region = cred.credentials.region;
  const registry = cred.credentials.registry;
  const repository = cred.credentials.repository;
  const projectId = JSON.parse(keyContex)["project_id"];
  const newImageTag = `${region}-docker.pkg.dev/${projectId}/${repository}/${choreoApp}:${process.env.NEW_SHA}`;
  const keyPath = "gcp-key.json";

  fs.writeFileSync(keyPath, keyContex, "utf-8");
  var child = spawn(
    `
    cat ${keyPath} | podman login -u _json_key --password-stdin ${registry} && \
    podman image tag ${process.env.DOCKER_TEMP_IMAGE}  ${newImageTag} && \
    podman push ${newImageTag} && \
    podman logout ${registry} && \
    rm -rf gcp-key.json`,
    {
      shell: true,
    }
  );
  var data = "";
  for await (const chunk of child.stdout) {
    console.log(chunk.toString());
    data += chunk;
  }
  var error = "";
  for await (const chunk of child.stderr) {
    console.error(chunk.toString());
    error += chunk;
  }
  const exitCode = await new Promise((resolve, reject) => {
    child.on("close", resolve);
  });

  if (exitCode) {
    throw new Error(`subprocess error exit ${exitCode}, ${error}`);
  }
  return data;
}

run().catch((error) => console.error(error));
