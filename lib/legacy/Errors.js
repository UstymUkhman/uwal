export const ERROR =
{
    CANVAS_NOT_FOUND: "CANVAS_NOT_FOUND",
    CONTEXT_NOT_FOUND: "CONTEXT_NOT_FOUND",
    SHADER_CODE_NOT_FOUND: "SHADER_CODE_NOT_FOUND",
    SHADER_MODULE_NOT_FOUND: "SHADER_MODULE_NOT_FOUND",
    VERTEX_ENTRY_NOT_FOUND: "VERTEX_ENTRY_NOT_FOUND",
    VERTEX_ATTRIBUTE_NOT_FOUND: "VERTEX_ATTRIBUTE_NOT_FOUND",
    RENDER_PASS_NOT_FOUND: "RENDER_PASS_NOT_FOUND",
    STORAGE_NOT_FOUND: "STORAGE_NOT_FOUND",
    UNIFORM_NOT_FOUND: "UNIFORM_NOT_FOUND",
    INVALID_UNIFORM_NAME: "INVALID_UNIFORM_NAME",
    BINDING_NOT_FOUND: "BINDING_NOT_FOUND",
    PIPELINE_NOT_FOUND: "PIPELINE_NOT_FOUND",
    COMMAND_ENCODER_NOT_FOUND: "COMMAND_ENCODER_NOT_FOUND"
};

export const ERROR_MESSAGE =
{
    CANVAS_NOT_FOUND: "Failed to get a WebGPU canvas.",
    CONTEXT_NOT_FOUND: "Failed to get a WebGPU context.",
    SHADER_CODE_NOT_FOUND: `Failed to get a WGSL shader when creating shader module.
        An empty shader will be used instead.`,
    SHADER_MODULE_NOT_FOUND: "Failed to get shader module in ",
    VERTEX_ENTRY_NOT_FOUND: "Failed to find function ",
    VERTEX_ATTRIBUTE_NOT_FOUND: "Failed to find vertex attribute ",
    RENDER_PASS_NOT_FOUND: "Failed to use pipeline in render pass because it has not started.",
    STORAGE_NOT_FOUND: "Failed to find storage ",
    UNIFORM_NOT_FOUND: "Failed to find uniform ",
    INVALID_UNIFORM_NAME: "Requested uniform is already in use and managed internally: ",
    BINDING_NOT_FOUND: "Failed to find binding ",
    PIPELINE_NOT_FOUND: "Failed to get a GPU",
    COMMAND_ENCODER_NOT_FOUND: "Failed to get a GPUCommandEncoder."
};

export const ERROR_CAUSE =
{
    CANVAS_NOT_FOUND: 5,
    CONTEXT_NOT_FOUND: 6,
    PIPELINE_NOT_FOUND: 7,
    COMMAND_ENCODER_NOT_FOUND: 8
};
