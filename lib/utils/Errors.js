export const ERROR =
{
    TIMESTAMP_QUERY_NOT_FOUND: "TIMESTAMP_QUERY_NOT_FOUND",
    COMMAND_BUFFER_SUBMITTED: "COMMAND_BUFFER_SUBMITTED"
};

export const ERROR_MESSAGE =
{
    TIMESTAMP_QUERY_NOT_FOUND: `"timestamp-query" feature is required to be set with
        \`Device.SetRequiredFeatures\` when creating a new \`GPUTiming\` instance.`,
    COMMAND_BUFFER_SUBMITTED: `Failed get \`GPUCommandEncoder\` because \`GPUCommandBuffer\` was already submitted.
        Pipeline's \`Render\` or \`Compute\` method has to be called with \`submit\` flag set to \`false\`.`
};
