export const ERROR =
{
    CANVAS_NOT_FOUND: "CANVAS_NOT_FOUND",
    CONTEXT_NOT_FOUND: "CONTEXT_NOT_FOUND",
    COMMAND_ENCODER_NOT_FOUND: "COMMAND_ENCODER_NOT_FOUND",
    VERTEX_STATE_NOT_FOUND: "VERTEX_STATE_NOT_FOUND",
    PIPELINE_NOT_FOUND: "PIPELINE_NOT_FOUND"
};

export const ERROR_MESSAGE =
{
    CANVAS_NOT_FOUND: "Failed to get a WebGPU canvas.",
    CONTEXT_NOT_FOUND: "Failed to get a WebGPU context.",
    COMMAND_ENCODER_NOT_FOUND: "Failed to get a GPUCommandEncoder.",
    VERTEX_STATE_NOT_FOUND: "Failed to get a GPUVertexState.",
    PIPELINE_NOT_FOUND: "Failed to get a GPU"
};

export const ERROR_CAUSE =
{
    CANVAS_NOT_FOUND: 5,
    CONTEXT_NOT_FOUND: 6,
    COMMAND_ENCODER_NOT_FOUND: 7,
    VERTEX_STATE_NOT_FOUND: 8,
    PIPELINE_NOT_FOUND: 9
};