const axios = require('axios').default;
const minimist = require('minimist');

function readInput() {
    const args = minimist(process.argv.slice(2));

    const baseURL = args['baseURL'];
    const componentId = args['componentId'];
    const versionId = args['versionId'];
    const sourceCommit = args['sourceCommit'];
    const gitOpsCommit = args['gitOpsCommit'] || null; // Allow gitOpsCommit to be null
    const status = args['status'];
    const configMappingId = args['configMappingId'];

    // gitOpsCommit is allowed to be null, so it's removed from this validation check
    if (!baseURL || !componentId || !versionId || !sourceCommit || !status || !configMappingId) {
        throw new Error("The arguments --baseURL, --componentId, --versionId, --sourceCommit, --status, and --configMappingId are required.");
    }

    return { baseURL, componentId, versionId, sourceCommit, gitOpsCommit, status, configMappingId };
}

async function main() {
    try {
        const { baseURL, componentId, versionId, sourceCommit, gitOpsCommit, status, configMappingId } = readInput();

        const url = `${baseURL}/orgs/choreo/projects/project/components/${componentId}/versions/${versionId}/commits/${sourceCommit}/configurable-commit-mapping`;
        const payload = {
            status: status,
            id: configMappingId,
            gitOpsCommit: gitOpsCommit // This can now be null
        };

        console.log("Payload:", payload);

        try {
            await axios.put(url, payload);
            console.log("choreo-update-config-generation-status", "saved");
        } catch (error) {
            console.error('Error', error);
            if (error.response) {
                console.log("choreo-status", error.response.data);
                console.log(error.response.status);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error', error.message);
                console.log("choreo-status", "failed");
            }
            process.exit(1); // Exit with a non-zero code to indicate failure
        }

    } catch (e) {
        console.log("choreo-update-config-generation-status-save", "failed");
        console.log("choreo-update-config-generation-status-save", e.message);
        process.exit(1); // Exit with a non-zero code to indicate failure
    }
}

// Execute the main function
main();
