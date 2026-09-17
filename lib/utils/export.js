import { Texture as TextureUtils } from "./Texture";
export * as MathUtils from "./Math";
import { Device } from "#/Device";
export { Color } from "./Color";

/**
 * Utility class to create and manage textures and samplers. Upon instantiation, it returns a promise of itself.
 * @param {Renderer} [Renderer] - Optional `Renderer` instance required in some methods.
 * @example const Texture = new (await UWAL.Texture());
 */
export function Texture(Renderer)
{
    return /** @type {Promise<TextureUtils & { new(): TextureUtils}>} */ ((async () =>
    {
        const device = await Device.GPUDevice;

        return device && new Proxy(TextureUtils,
        {
            construct(TextureUtils)
            {
                return new TextureUtils(device, Device.PreferredCanvasFormat, Renderer);
            }
        });
    })());
}
