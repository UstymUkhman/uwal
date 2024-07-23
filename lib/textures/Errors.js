export const ERROR =
{
    RENDER_PIPELNE_NOT_FOUND: "RENDER_PIPELNE_NOT_FOUND",
    TEXTURE_SIZE_NOT_FOUND: "TEXTURE_SIZE_NOT_FOUND",
    TEXTURE_NOT_FOUND: "TEXTURE_NOT_FOUND"
};

export const ERROR_MESSAGE =
{
    RENDER_PIPELNE_NOT_FOUND: `"UWAL.RenderPipeline" is required in \`Texture\` when generating mipmaps.
        Use \`Texture.Renderer\` setter before creating a `,
    TEXTURE_SIZE_NOT_FOUND: "`size` array or a `width` value is required in `options` parameter of ",
    TEXTURE_NOT_FOUND: "CopyImageToTexture `options` is required to have a `texture` value or a `create` entry."
};
