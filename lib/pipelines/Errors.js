export const ERROR =
{
    SHADER_CODE_NOT_FOUND: "SHADER_CODE_NOT_FOUND",
    SHADER_MODULE_NOT_FOUND: "SHADER_MODULE_NOT_FOUND",
    VERTEX_ENTRY_NOT_FOUND: "VERTEX_ENTRY_NOT_FOUND",
    VERTEX_ATTRIBUTE_NOT_FOUND: "VERTEX_ATTRIBUTE_NOT_FOUND",
    UNIFORM_NOT_FOUND: "UNIFORM_NOT_FOUND",
    STORAGE_NOT_FOUND: "STORAGE_NOT_FOUND",
    INVALID_UNIFORM_NAME: "INVALID_UNIFORM_NAME",
    BINDING_NOT_FOUND: "BINDING_NOT_FOUND",
    PIPELINE_NOT_FOUND: "PIPELINE_NOT_FOUND"
};

export const ERROR_MESSAGE =
{
    SHADER_CODE_NOT_FOUND: `Failed to get a WGSL shader when creating shader module.
        An empty shader will be used instead.`,
    SHADER_MODULE_NOT_FOUND: "Failed to get shader module in ",
    VERTEX_ENTRY_NOT_FOUND: "Failed to find function ",
    VERTEX_ATTRIBUTE_NOT_FOUND: "Failed to find vertex attribute ",
    UNIFORM_NOT_FOUND: "Failed to find uniform ",
    STORAGE_NOT_FOUND: "Failed to find storage ",
    INVALID_UNIFORM_NAME: "Requested uniform is already in use and managed internally: ",
    BINDING_NOT_FOUND: "Failed to find binding ",
    PIPELINE_NOT_FOUND: "Failed to get GPU"
};

export const ERROR_CAUSE = { PIPELINE_NOT_FOUND: 8 };
