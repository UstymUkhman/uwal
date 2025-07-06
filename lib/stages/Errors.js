export const ERROR =
{
    CANVAS_NOT_FOUND: "CANVAS_NOT_FOUND",
    CONTEXT_NOT_FOUND: "CONTEXT_NOT_FOUND",
    RENDER_PASS_NOT_FOUND: "RENDER_PASS_NOT_FOUND",
    COMMAND_ENCODER_NOT_FOUND: "COMMAND_ENCODER_NOT_FOUND"
};

export const ERROR_MESSAGE =
{
    CANVAS_NOT_FOUND: "Failed to get a WebGPU canvas.",
    CONTEXT_NOT_FOUND: "Failed to get a WebGPU context.",
    RENDER_PASS_NOT_FOUND: "Failed to use pipeline in render pass because it has not started.",
    COMMAND_ENCODER_NOT_FOUND: "Failed to get a GPUCommandEncoder."
};

export const ERROR_CAUSE =
{
    CANVAS_NOT_FOUND: 5,
    CONTEXT_NOT_FOUND: 6,
    COMMAND_ENCODER_NOT_FOUND: 7
};
