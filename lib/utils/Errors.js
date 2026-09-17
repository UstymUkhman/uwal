export const ERROR =
{
    TIMESTAMP_QUERY_NOT_FOUND: "TIMESTAMP_QUERY_NOT_FOUND",
    COMMAND_BUFFER_SUBMITTED: "COMMAND_BUFFER_SUBMITTED",
    INVALID_ROTATION_ORDER: "INVALID_ROTATION_ORDER",

    TEXTURE_SIZE_NOT_FOUND: "TEXTURE_SIZE_NOT_FOUND",
    INVALID_BYTES_PER_ROW: "INVALID_BYTES_PER_ROW",
    RENDERER_NOT_FOUND: "RENDERER_NOT_FOUND",
    DESCRIPTOR_SIZE_NOT_FOUND: "DESCRIPTOR_SIZE_NOT_FOUND",
    TEXTURE_NOT_FOUND: "TEXTURE_NOT_FOUND"
};

export const ERROR_MESSAGE =
{
    TIMESTAMP_QUERY_NOT_FOUND: `"timestamp-query" feature is required to be set with
        \`Device.SetRequiredFeatures\` when creating a new \`GPUTiming\` instance.`,
    COMMAND_BUFFER_SUBMITTED: `Failed get \`GPUCommandEncoder\` because \`GPUCommandBuffer\` was already submitted.
        Pipeline's \`Render\` or \`Compute\` method has to be called with \`submit\` flag set to \`false\`.`,
    INVALID_ROTATION_ORDER: "Invalid rotation order ",

    TEXTURE_SIZE_NOT_FOUND: "`size` array or a `width` value is required in the `options` argument of ",
    INVALID_BYTES_PER_ROW: "`bytesPerRow` parameter is not a multiple of 256 in ",
    RENDERER_NOT_FOUND: `"Device.Renderer" instance is required in \`Texture\` for this operation.
        Pass it to the \`Texture\` constructor or use \`Texture.Renderer\` setter before `,
    DESCRIPTOR_SIZE_NOT_FOUND: `\`size\` parameter is required in the \`descriptor\` argument of \`CreateStorageTexture\`
        method.`,
    TEXTURE_NOT_FOUND: `\`options\` is required to have a \`texture\` value or its \`create\` entry
        to be either \`true\` or a \`TextureDescriptor\` object when calling `
};
