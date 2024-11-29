const fs = require("fs");
const path = require("path");
const readComponentConfigYaml = require("./config_readers/component_config_reader");
const readEndpointsYaml = require("./config_readers/endpoints_reader");
const readComponentYaml = require("./config_readers/component_reader");

const userRepoPath = process.env.USER_REPO_PATH;
const prismImage = process.env.CHOREO_MANAGED_PRISM_IMAGE;
if (!userRepoPath) {
  console.error("Error: USER_REPO_PATH environment variable is not set.");
  process.exit(1);
}

if (!prismImage) {
  console.error(
    "Error: CHOREO_MANAGED_PRISM_IMAGE environment variable is not set."
  );
  process.exit(1);
}

let endpoints = [];
if (fs.existsSync(`${userRepoPath}/.choreo/component.yaml`)) {
  endpoints = readComponentYaml(userRepoPath);
} else if (fs.existsSync(`${userRepoPath}/.choreo/component-config.yaml`)) {
  endpoints = readComponentConfigYaml(userRepoPath);
} else if (fs.existsSync(`${userRepoPath}/.choreo/endpoints.yaml`)) {
  endpoints = readEndpointsYaml(userRepoPath);
} else {
  console.error("Error: No valid configuration file found.");
  process.exit(1);
}

// Create the Dockerfile content
let dockerfileContent = [
  `FROM ${prismImage}`,
  `RUN chmod +x /usr/local/bin/prism`,
  "COPY --from=choreocontrolplane.azurecr.io/golang:1.22.4-alpine /usr/local/go /usr/local/go",
  'ENV PATH="/usr/local/go/bin:${PATH}"',
].join("\n");

// Create the entrypoint.sh content
let entrypointContent = [
  `#!/bin/sh`,
  "cd /choreo/prism-traffic-router",
].join("\n");

let entrypointGoCommand = "go run ./main.go ";
let prismPort = 4015;

endpoints.forEach((endpoint, index) => {
  const schemaFile = endpoint.schemaFilePath;
  const port = endpoint.port;
  const basePath = endpoint.basePath;

  // Update Dockerfile to copy the schema files
  dockerfileContent += `\nCOPY ${schemaFile} /choreo/${schemaFile}\n`;

  // Update entrypoint.sh to start prism mock server separately for each schema file
  entrypointContent += `\nprism mock -m -p ${prismPort} -h localhost -v warn /choreo/${schemaFile} &\n`
  prismPort++;

  // Provide port, basePath and schema file to go-based reverse proxy
  entrypointGoCommand += `${port} ${basePath} /choreo/${schemaFile} `
});

dockerfileContent += [
  "COPY prism-traffic-router/main.go /choreo/prism-traffic-router/main.go",
  "COPY prism-traffic-router/go.mod /choreo/prism-traffic-router/go.mod",
  "RUN go build -o /choreo/prism-traffic-router/main /choreo/prism-traffic-router/main.go",
  "RUN chmod +x /choreo/prism-traffic-router/main",
  "COPY entrypoint.sh /choreo/entrypoint.sh",
  "RUN chmod +x /choreo/entrypoint.sh",
  `ENTRYPOINT ["/choreo/entrypoint.sh"]`,
].join("\n");

entrypointContent += entrypointGoCommand;
entrypointContent += "&\nwait";

fs.mkdirSync("temp", { recursive: true });

fs.writeFileSync("temp/Dockerfile", dockerfileContent.trim());
console.log("Dockerfile generated successfully.");

fs.writeFileSync("temp/entrypoint.sh", entrypointContent.trim());
console.log("entrypoint.sh generated successfully.");

endpoints.forEach((endpoint, index) => {
  fs.mkdirSync(path.dirname(`temp/${endpoint.schemaFilePath}`), {
    recursive: true,
  });
  const schemaFilePath = `${userRepoPath}/${endpoint.schemaFilePath}`;
  const schemaFile = fs.readFileSync(schemaFilePath, "utf8");
  fs.writeFileSync(`temp/${endpoint.schemaFilePath}`, schemaFile);
});
console.log("Schema files copied successfully.");

fs.mkdirSync("temp/prism-traffic-router", { recursive: true });
fs.copyFileSync(
  "prism-traffic-router/main.go",
  "temp/prism-traffic-router/main.go"
);
fs.copyFileSync(
  "prism-traffic-router/go.mod",
  "temp/prism-traffic-router/go.mod"
);
console.log("prism-traffic-router files copied successfully.");
