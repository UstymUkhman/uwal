export { default as Texture } from "./Texture";
export * as TEXTURE from "./Constants";
// import { Device } from "#/Device";
// import Texture from "./Texture";
//
// /**
//  * @param {typeof Device} Device
//  * @param {Renderer} [Renderer]
//  */
// export default function(Device, Renderer)
// {
//     return /** @type {Promise<Texture & { new(): Texture }>} */ ((async () =>
//     {
//         const device = await Device.GPUDevice;
//
//         return device && new Proxy(Texture,
//         {
//             construct(Texture)
//             {
//                 return new Texture(device, Renderer, Device.PreferredCanvasFormat);
//             }
//         });
//     })());
// }
