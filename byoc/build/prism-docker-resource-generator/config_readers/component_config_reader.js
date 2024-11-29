const fs = require("fs");
const yaml = require("js-yaml");

function readConfig(userRepoPath) {
  const componentConfigFilePath = `${userRepoPath}/.choreo/component-config.yaml`;
  const fileContents = fs.readFileSync(componentConfigFilePath, "utf8");
  const componentConfig = yaml.load(fileContents);

  const inboundConfigs = componentConfig.spec.inbound;

  let endpoints = [];

  inboundConfigs.forEach((inbound, index) => {
    endpoints.push({
      schemaFilePath: inbound.schemaFilePath,
      port: inbound.port,
      basePath: inbound.context,
    });
  });

  return endpoints;
}

module.exports = readConfig;
