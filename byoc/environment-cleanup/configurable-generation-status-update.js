
const axios = require("axios").default;
const minimist = require("minimist");

function readInput() {
  const args = minimist(process.argv.slice(2));

  const {
    baseURL,
    componentId,
    versionId,
    sourceCommit,
    gitOpsCommit = null,
    status,
    configMappingId,
  } = args;

  const requiredArgs = {
    baseURL,
    componentId,
    versionId,
    sourceCommit,
    status,
    configMappingId,
  };

  for (const [key, value] of Object.entries(requiredArgs)) {
    if (!value) throw new Error(`The argument --${key} is required.`);
  }

  return {
    ...requiredArgs,
    gitOpsCommit
  };
}

async function main() {
  try {
    const {
      baseURL,
      componentId,
      versionId,
      sourceCommit,
      gitOpsCommit,
      status,
      configMappingId,
    } = readInput();

    const url = `${baseURL}/orgs/choreo/projects/project/components/${componentId}/versions/${versionId}/commits/${sourceCommit}/configurable-commit-mapping`;
    const payload = {
      status: status,
      id: configMappingId,
      gitOpsCommit: gitOpsCommit,
    };

    try {
      await axios.put(url, payload);
      console.log("choreo-update-config-generation-status", "saved");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("Error response data:", error.response.data);
          console.error("HTTP Status:", error.response.status);
        } else if (error.request) {
          console.error("No response received:", error.request);
        }
      } else {
        console.error("Unexpected error:", error.message);
      }
      process.exit(1);
    }
  } catch (e) {
    console.error("choreo-update-config-generation-status-save has failed:", e.message);
    process.exit(1);
  }
}

main();
