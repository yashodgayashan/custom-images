const sourceConfigFileTypes = {
  COMPONENT_YAML: "component.yaml",
  COMPONENT_CONFIG_YAML: "component-config.yaml",
  ENDPOINT_YAML: "endpoints.yaml",
};

const errCodes = {
  USER_ERROR: "USER ERROR",
  INTERNAL_ERROR: "INTERNAL ERROR",
};

const ChoreoRepository = {
    CHOREO_MANAGE: "ChoreoManaged",
    USER_MANAGE: "UserManagedEmpty",
    USER_MANAGE_NON_EMPTY: "UserManagedNonEmpty",
    USER_MANAGE_BUILDPACKS: "UserManagedBuildpacks"
}

const ChoreoBasicTemplates = ["service", "main", "webhook"]

module.exports = {
  sourceConfigFileTypes,
  errCodes,
  ChoreoRepository,
  ChoreoBasicTemplates
};
