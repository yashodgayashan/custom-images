// script.js

const axios = require('axios').default;

// Ensure enough arguments are provided
if (process.argv.length < 8) {
    console.log("Usage: node script.js <baseURL> <runId> <componentId> <statusSequenceNo> <ghActionType> <token>");
    process.exit(1);
}

// Get input values from command line arguments
const baseURL = process.argv[2];
const runId = process.argv[3];
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
        runId: parseInt(runId),
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
    console.log("choreo-action-run-status-save", "failed");
    console.log("choreo-action-run-status-save", e.message);
}
