// import { Device } from "#/Device";
// import RenderStage from "./RenderStage";
// import ComputeStage from "./ComputeStage";
export { default as RenderStage } from "./RenderStage";
export { default as ComputeStage } from "./ComputeStage";

// /**
//  * @import { ConfigurationOptions, CanvasConfiguration } from "../Device"
//  * @param {typeof Device} Device
//  * @param {HTMLCanvasElement} canvas
//  * @param {string} [name = ""]
//  * @param {ConfigurationOptions} [options = {}]
//  */
// export function Renderer(Device, canvas, name = "", options = {})
// {
//     Device.DescriptorLabel = name;
//
//     options.format ??= Device.PreferredCanvasFormat;
//
//     return /** @type {Promise<Renderer & { new(): Renderer }>} */ ((async () =>
//     {
//         const device = await Device.GPUDevice;
//
//         return device && new Proxy(RenderStage,
//         {
//             construct(Stage)
//             {
//                 return new Stage(device, canvas, /** @type {CanvasConfiguration} */ (options), name);
//             }
//         });
//     })());
// }
//
// /**
//  * @param {typeof Device} Device
//  * @param {string} [name = ""]
//  */
// export function Computation(Device, name)
// {
//     Device.DescriptorLabel = name;
//
//     return /** @type {Promise<Computation & { new(): Computation }>} */ ((async () =>
//     {
//         const device = await Device.GPUDevice;
//
//         return device && new Proxy(ComputeStage,
//         {
//             construct(Stage)
//             {
//                 return new Stage(device, name);
//             }
//         });
//     })());
// }
