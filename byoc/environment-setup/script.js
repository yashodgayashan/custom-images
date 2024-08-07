/**
 * This script is used to save the status of the action run in the Choreo platform.
 * 
 * Usage: node script.js <baseURL> <workflowId> <componentId> <statusSequenceNo> <ghActionType> <token>
 * 
 * @param {String} baseURL - The base URL of the Choreo platform.
 * @param {String} workflowId - The workflow ID.
 * @param {String} componentId - The component ID.
 * @param {String} statusSequenceNo - The sequence number of the status. Possible values are: 0 - QUEUED, 10 - IN_PROGRESS, 20 - COMPLETED.
 * @param {String} ghActionType - The GitHub action type. Possible values are: "BUILD_DEPLOY", "MEDIATION_CODE_GENERATOR", "CONFIGURABLE_GENERATOR".
 * @param {String} token - The token to authenticate the request.
 */

const axios = require('axios').default;

if (process.argv.length < 8) {
    console.log("Usage: node script.js <baseURL> <workflowId> <componentId> <statusSequenceNo> <ghActionType> <token>");
    process.exit(1);
}

// Get input values from command line arguments
const baseURL = process.argv[2];
const workflowId = process.argv[3];
const componentId = process.argv[4];
const sequenceNo = process.argv[5];
const ghActionType = process.argv[6];
const token = process.argv[7];

try {
    const url = `${baseURL}/component-utils/1.0.0/actions/runs/status`;
    const headers = {
        'Authorization': `Bearer ${token}`,
    };
    const payload = {
        componentId: componentId,
        workflowId: workflowId,
        sequenceNo: parseInt(sequenceNo),
        ghActionType: ghActionType
    };
    console.log("Payload: ", payload);
    axios.post(url, payload, {
        headers: headers
    }).then(
        () => {
            console.log("choreo-action-run-status", "saved");
        }
    ).catch((error) => {
        console.error('Error', error);
        if (error.response) {
            console.log("choreo-status", error.response.status);
        } else if (error.request) {
            console.log(error.request);
        } else {
            console.log('Error', error.message);
            console.log("choreo-status", "failed");
        }
    });
} catch (e) {
    console.log("choreo-action-run-status-save", e.message);
}
