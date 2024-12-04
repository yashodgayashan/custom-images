/*
 * Copyright (c) 2024, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

const fs = require("fs");
const yaml = require("js-yaml");
const path = require("path");
const minimist = require("minimist");
const {
  componentYamlSchemaV1D0,
  componentYamlSchemaV1D1,
  endpointYamlSchemaV0D1,
  componentConfigYamlSchemaV1beta1,
} = require("./schemas");
const { sourceConfigFileTypes, errCodes } = require("./enums");


function readInput() {
  const args = minimist(process.argv.slice(2));
  
  const sourceRootDir = args["source-root-dir"];
  const fileType = args["file-type"];
  
  if (!sourceRootDir || !fileType) {
    throw new Error("Both --source-root-dir and --file-type arguments are required");
  }

  return [sourceRootDir, fileType];
}

function readSrcConfigYaml(filePath, fileType) {
  try {
    let fullPath = path.join(filePath, ".choreo");
    if (
      fileType === sourceConfigFileTypes.COMPONENT_YAML ||
      fileType === sourceConfigFileTypes.ENDPOINT_YAML ||
      fileType === sourceConfigFileTypes.COMPONENT_CONFIG_YAML
    ) {
      fullPath = path.join(fullPath, fileType);
    } else {
      throw new Error(`'${fileType}' is not a valid source config file type`);
    }

    let fileContent = fs.readFileSync(fullPath, "utf8");
    return fileContent;
  } catch (error) {
    throw new Error(
      `${errCodes.USER_ERROR} Failed to read source config file: ${error.message}`
    );
  }
}

function parseYaml(fileContent) {
  try {
    return yaml.load(fileContent);
  } catch (error) {
    throw new Error(
      `${errCodes.USER_ERROR} Failed to parse yaml: ${error.message}`
    );
  }
}

function constructValidationErrorMessage(err, fileType) {
  const errors = err.errors;
  if (!errors || errors.length == 0) {
    return (
      `${errCodes.INTERNAL_ERROR} Failed to validate ${fileType}, something went wrong:` +
      err
    );
  }
  const errorMsg = `${errCodes.USER_ERROR} ${fileType} validation failed: `;
  const errorList =
    errors.length === 1 ? errors[0] : errors.map((e) => `\n- ${e}`).join("");
  return errorMsg + errorList;
}

async function validateComponentYaml(sourceRootDir, schemaVersion) {
  parsedSchemaVersion = Number(schemaVersion);
  switch (parsedSchemaVersion) {
    case 1.0:
      await componentYamlSchemaV1D0(sourceRootDir).validate(srcConfigYamlFile, {
        abortEarly: false,
      });
      break;
    case 1.1:
      await componentYamlSchemaV1D1(sourceRootDir).validate(srcConfigYamlFile, {
        abortEarly: false,
      });
      break;
    default:
      throw new Error(
        `SchemaVersion must be one of the following values: 1.0, 1.1`
      );
  }
}

async function validateSourceConfigFile(sourceRootDir, fileType) {
  try {
    switch (fileType) {
      case sourceConfigFileTypes.COMPONENT_YAML:
        const schemaVersion = srcConfigYamlFile.schemaVersion;
        await validateComponentYaml(sourceRootDir, schemaVersion);
        break;
      case sourceConfigFileTypes.COMPONENT_CONFIG_YAML:
        await componentConfigYamlSchemaV1beta1(sourceRootDir).validate(
          srcConfigYamlFile,
          { abortEarly: false }
        );
        break;
      case sourceConfigFileTypes.ENDPOINT_YAML:
        await endpointYamlSchemaV0D1(sourceRootDir).validate(
          srcConfigYamlFile,
          { abortEarly: false }
        );
        break;
      default:
        throw new Error(`'${fileType}' is not a valid source config file type`);
    }
    // Validate the component YAML file
  } catch (err) {
    throw new Error(constructValidationErrorMessage(err, fileType));
  }
}

async function main() {
  try {
    const [sourceRootDir, fileType] = readInput();
    console.log(`Validating ${fileType} in ${sourceRootDir}`);
    const fileContent = readSrcConfigYaml(sourceRootDir, fileType);
    console.log("Source config file read succeeded");
    console.log("fileContent:", fileContent);
    const srcConfigYamlFile = parseYaml(fileContent);
    await validateSourceConfigFile(sourceRootDir, fileType, srcConfigYamlFile);
    console.log("Source config file validation succeeded");
  } catch (error) {
    console.error(error.message);
    process.exit(1); // Exit with a non-zero code to indicate failure
  }
}

// Execute the main function
main();
