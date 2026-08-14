/** @module TextureUtils */

import { Device } from "#/Device";
import { Texture } from "./Texture";

/** @hidden */
export * as TEXTURE from "./Constants";

/**
 * @param {Renderer} [Renderer] - `Renderer` instance required in some methods.
 * @see [Texture](./Texture-1) class for method reference.
 * @returns A promise of the [Texture](./Texture-1) class.
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
