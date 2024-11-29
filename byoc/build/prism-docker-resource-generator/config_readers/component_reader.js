const fs = require("fs");
const yaml = require("js-yaml");

function readConfig(userRepoPath) {
  const componentsFilePath = `${userRepoPath}/.choreo/component.yaml`;
  const fileContents = fs.readFileSync(componentsFilePath, "utf8");
  const componentsConfig = yaml.load(fileContents);

  let endpoints = [];

  componentsConfig.endpoints.forEach((endpoint, index) => {
    endpoints.push({
      schemaFilePath: endpoint.schemaFilePath,
      port: endpoint.service.port,
      basePath: endpoint.service.basePath,
    });
  });

  return endpoints;
}

module.exports = readConfig;
