const fs = require("fs");
const yaml = require("js-yaml");

function readConfig(userRepoPath) {
  const endpointsFilePath = `${userRepoPath}/.choreo/endpoints.yaml`;
  const fileContents = fs.readFileSync(endpointsFilePath, "utf8");
  const endpointConfig = yaml.load(fileContents);

  let endpoints = [];

  endpointConfig.endpoints.forEach((endpoint, index) => {
    endpoints.push({
      schemaFilePath: endpoint.schemaFilePath,
      port: endpoint.port,
      basePath: endpoint.context,
    });
  });

  return endpoints;
}

module.exports = readConfig;
