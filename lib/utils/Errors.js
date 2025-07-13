export const ERROR =
{
    ACTIVE_PIPELINE_NOT_FOUND: "ACTIVE_PIPELINE_NOT_FOUND",
    TIMESTAMP_QUERY_NOT_FOUND: "TIMESTAMP_QUERY_NOT_FOUND"
};

export const ERROR_MESSAGE =
{
    ACTIVE_PIPELINE_NOT_FOUND: "At least one active pipeline is required when creating \"timestamp-query\" buffers.",
    TIMESTAMP_QUERY_NOT_FOUND: `"timestamp-query" feature is required to be set with
        \`Device.SetRequiredFeatures\` when creating a new \`GPUTiming\` instance.`
};
