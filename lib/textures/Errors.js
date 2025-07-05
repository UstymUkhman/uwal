export const ERROR =
{
    RENDER_PIPELNE_NOT_FOUND: "RENDER_PIPELNE_NOT_FOUND",
    TEXTURE_SIZE_NOT_FOUND: "TEXTURE_SIZE_NOT_FOUND",
    TEXTURE_NOT_FOUND: "TEXTURE_NOT_FOUND",
    INVALID_BYTES_PER_ROW: "INVALID_BYTES_PER_ROW"
};

export const ERROR_MESSAGE =
{
    RENDER_PIPELNE_NOT_FOUND: `"Device.RenderPipeline" instance is required in \`Texture\` for this operation.
        Pass it to the \`Texture\` constructor or use \`Texture.LegacyRenderer\` setter before `,
    TEXTURE_SIZE_NOT_FOUND: "`size` array or a `width` value is required in `options` parameter of ",
    TEXTURE_NOT_FOUND: `\`options\` is required to have a \`texture\` value or its \`create\` entry
        to be either \`true\` or a \`TextureDescriptor\` object when calling `,
    INVALID_BYTES_PER_ROW: "`bytesPerRow` parameter is not multiple of 256 in "
};
