/** @module TextureUtils */

import { Device } from "#/Device";
import { Texture } from "./Texture";
import { CreateConstantObject } from "#/utils";

/**
 * @param {Renderer} [Renderer] - `Renderer` instance required in some methods.
 * @see [Texture](./Texture) class for method reference.
 * @returns A promise of the [Texture](./Texture) class.
 * @example const Texture = new (await UWAL.TextureUtils());
 */
export function TextureUtils(Renderer)
{
    return /** @type {Promise<Texture & { new(): Texture }>} */ ((async () =>
    {
        const device = await Device.GPUDevice;

        return device && new Proxy(Texture,
        {
            construct(Texture)
            {
                return new Texture(device, Device.PreferredCanvasFormat, Renderer);
            }
        });
    })());
}

/**
 * Some utility bitmasks of the `GPUTextureUsage` flags.
 * - `TEXTURE.RENDER` is the default usage when creating a texture.
 * - `TEXTURE.STORAGE` is the default usage when creating a storage texture.
 *
 * @typedef {Readonly<Record<"RENDER" | "STORAGE", GPUTextureUsageFlags>>} Usage
 * @type {Usage}
 */
export const TEXTURE = /*@__PURE__*/ CreateConstantObject(
{
    RENDER: GPUTextureUsage.RENDER_ATTACHMENT |
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST,

    STORAGE: GPUTextureUsage.STORAGE_BINDING |
        GPUTextureUsage.TEXTURE_BINDING
});
