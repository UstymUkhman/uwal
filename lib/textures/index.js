export * as TEXTURE from "./Constants";
import { Device } from "#/Device";
import Texture from "./Texture";

/** @param {Renderer} [Renderer] */
export default function(Renderer)
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
