const yaml = require("js-yaml");
const path = require("path");
const fs = require("fs");
const minimist = require("minimist");

const jsonSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {},
  required: [],
};

function readComponentYaml(filePath) {
  try {
    const fullPath = path.join(filePath, ".choreo", "component.yaml");
    const fileContent = fs.readFileSync(fullPath, "utf8");
    return fileContent;
  } catch (error) {
    throw new Error(`Failed to read component.yaml: ${error.message}`);
  }
}

function isBaseType(type) {
  return type === "string" || type === "integer" || type === "boolean";
}

function generateSchemaForBaseType(schema, requiredItems, type) {
  if (schema.required === undefined || schema.required) {
    requiredItems.push(schema.name);
  }
  const generatedSchema = {
    type: type,
  };
  if (schema.values) {
    generatedSchema.enum = schema.values;
  }
  if (schema.displayName) {
    generatedSchema.title = schema.displayName;
  }
  return generatedSchema;
}

function generateSchemaFromYaml(schema, requiredItems) {
  if (isBaseType(schema.type)) {
    return generateSchemaForBaseType(schema, requiredItems, schema.type);
  }

  if (schema.type === "array") {
    const generatedSchema = {
      type: "array",
      items: {},
      title: schema.displayName,
    };
    if (isBaseType(schema.items.type)) {
      generatedSchema.items.type = schema.items.type;
      return generatedSchema;
    }
    return {
      type: "array",
      items: generateSchemaFromYaml(schema.items, requiredItems),
      title: schema.displayName,
    };
  }

  if (schema.type === "object") {
    let properties = {};
    let required = [];
    if (schema.properties) {
      schema.properties.forEach((property) => {
        properties[property.name] = generateSchemaFromYaml(property, required);
      });
    }
    return {
      type: "object",
      properties: properties,
      required: required,
      title: schema.displayName,
    };
  }
}

function main() {
  try {
    const args = minimist(process.argv.slice(2));
    const sourceRootDir = args["source-root-dir"];

    if (!sourceRootDir) {
      throw new Error("The --source-root-dir argument is required");
    }

    const fileContent = readComponentYaml(sourceRootDir);
    const componentYamlFile = yaml.load(fileContent);

    componentYamlFile.configurations?.schema.forEach((item) => {
      jsonSchema.properties[item.name] = generateSchemaFromYaml(
        item,
        jsonSchema.required
      );
    });

    fs.writeFileSync(
      `${sourceRootDir}/choreo-config-schema.json`,
      JSON.stringify(jsonSchema, null, 2),
      "utf-8"
    );

    console.log("Configuration schema generation succeeded");
  } catch (error) {
    console.error("Config schema generation failed:", error.message);
    process.exit(1);
  }
}

// Execute the main function
main();
