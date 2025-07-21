export const ERROR =
{
    TIMESTAMP_QUERY_NOT_FOUND: "TIMESTAMP_QUERY_NOT_FOUND",
    RENDER_PASS_ENDED: "RENDER_PASS_ENDED"
};

export const ERROR_MESSAGE =
{
    TIMESTAMP_QUERY_NOT_FOUND: `"timestamp-query" feature is required to be set with
        \`Device.SetRequiredFeatures\` when creating a new \`GPUTiming\` instance.`,
    RENDER_PASS_ENDED: `Failed get a render pass because it has ended.
        \`Render\` method has to be called with \`submit\` flag set to \`false\`.`
};
