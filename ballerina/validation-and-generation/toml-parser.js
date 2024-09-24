const fs = require('fs');
const toml = require('toml');
const json2toml = require('json2toml');
const minimist = require('minimist');
const enums = require('./enums');

function readInput() {
    const args = minimist(process.argv.slice(2), {
        default: {
            type: 'edit'  // Set default value for type as 'edit'
        }
    });
    
    const componentType = args['componentType'] || null; // Make componentType optional
    const subPath = args['subPath'];
    const type = args['type'];
    const name = args['name'];
    const org = args['org'];
    const template = args['template'];

    if (!subPath) {
        throw new Error("The argument --subPath is required.");
    }

    return { componentType, subPath, type, name, org, template };
}

function main() {
    try {
        const { componentType, subPath, type, name, org, template } = readInput();
        const config = toml.parse(fs.readFileSync(`${subPath}/Ballerina.toml`, 'utf-8'));

        switch (type) {
            case 'edit':
                if (!name || !org) {
                    throw new Error("The arguments --name and --org are required for 'edit' type.");
                }

                const sanitizedName = name.replace(/[^\w-_]+/g, "").replace(/[^\w]+/g, "_");
                const sanitizedOrg = org.replace(/[^\w-_]+/g, "").replace(/[^\w]+/g, "_");

                let packageConfig = {};
                if (config.package) {
                    packageConfig = config.package;
                }

                if (componentType === enums.ChoreoRepository.USER_MANAGE_NON_EMPTY || componentType === enums.ChoreoRepository.USER_MANAGE_BUILDPACKS) {
                    if (!packageConfig.name) packageConfig.name = sanitizedName;
                    if (!packageConfig.org) packageConfig.org = sanitizedOrg;
                } else {
                    packageConfig.name = sanitizedName;
                    packageConfig.org = sanitizedOrg;
                    if (!enums.ChoreoBasicTemplates.includes(template)) {
                        packageConfig.export = [sanitizedName];

                        fs.readFile(`${subPath}/Dependencies.toml`, 'utf8', function (err, data) {
                            if (err) {
                                console.error(err);
                                process.exit(1);
                            }
                            let result = data.replace(/choreo/g, sanitizedOrg);
                            result = result.replace(/proj/g, sanitizedName);

                            fs.writeFile(`${subPath}/Dependencies.toml`, result, 'utf8', function (err) {
                                if (err) {
                                    console.error(err);
                                    process.exit(1);
                                }
                            });
                        });
                    }
                }

                config.package = packageConfig;

                const isCloudTomlExists = fs.existsSync(`${subPath}/Cloud.toml`);
                let cloudToml = {};
                if (isCloudTomlExists) {
                    cloudToml = toml.parse(fs.readFileSync(`${subPath}/Cloud.toml`, 'utf-8'));
                    if (cloudToml.settings) {
                        cloudToml.settings.buildImage = false;
                    } else {
                        cloudToml.settings = {
                            buildImage: false
                        };
                    }
                } else {
                    cloudToml = {
                        settings: {
                            buildImage: false
                        }
                    };
                }

                fs.writeFileSync(`${subPath}/Ballerina.toml`, json2toml(config, { indent: 2, newlineAfterSection: true }));
                fs.writeFileSync(`${subPath}/Cloud.toml`, json2toml(cloudToml, { indent: 2, newlineAfterSection: true }));
                break;

            case 'read':
                const context = '\
                [ballerina]\n\
                    [ballerina.observe]\n\
                        enabled = true\n\
                        provider = "choreo"\n\
                [ballerinax]\n\
                    [ballerinax.choreo]\n\
                        reporterHostname = "periscope.preview-dv.choreo.dev"\n\
                        reporterPort = 443';
                let workspace = 'workspace';
                if (config.package && config.package.name) {
                    workspace = config.package.name;
                }
                fs.writeFileSync(`${subPath}/Config.toml`, context, 'utf-8');
                fs.writeFileSync(`${subPath}/workspace.txt`, workspace, 'utf-8');
                break;

            default:
                console.error("Invalid type specified. Use 'edit' or 'read'.");
                process.exit(1);
        }
    } catch (error) {
        console.error(error.message, "Ballerina.toml not found or failed!");
        process.exit(1); // Exit with a non-zero code to indicate failure
    }
}

// Execute the main function
main();
