import{U as o}from"./index-SclxQHPZ.js";var g="@compute @workgroup_size(1)fn compute(@builtin(global_invocation_id)id: vec3u){let center=vec2f(textureDimensions(Texture))/2.0;let dist=distance(vec2f(id.xy),center);textureStore(Texture,id.xy,select(vec4f(1,0,0,1),vec4f(0,1,1,1),dist/32.0 % 2.0<1.0));}";/**
 * @module Storage Textures
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Storage Textures
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-storage-textures.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.6
 * @license MIT
 */(async function(i){const u=await o.SetRequiredFeatures("bgra8unorm-storage"),n=o.PreferredCanvasFormat,s=u.includes("bgra8unorm-storage")&&n==="bgra8unorm"?n:"rgba8unorm";n==="bgra8unorm"&&s==="rgba8unorm"&&console.warn('Preferred canvas format is "bgra8unorm", but since "bgra8unorm-storage" feature is not available on this device, a less performant "rgba8unorm" format will be used instead, in order to enable storage textures for this program.');let e,t;try{e=new(await o.ComputePipeline()),t=new(await o.RenderPipeline(i,"Storage Textures",{usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.STORAGE_BINDING}))}catch(r){alert(r)}const c=e.CreateShaderModule([`@group(0) @binding(0) var Texture: texture_storage_2d<${s}, write>;`,g]);e.CreatePipeline({module:c});function d(){const{width:r,height:a}=t.CurrentTexture;e.SetBindGroups(e.CreateBindGroup(e.CreateBindGroupEntries(t.CurrentTextureView))),e.Workgroups=[r,a],e.Compute(!0)}new ResizeObserver(r=>{for(const a of r){const{inlineSize:l,blockSize:m}=a.contentBoxSize[0];t.SetCanvasSize(l,m)}d()}).observe(i)})(document.getElementById("lesson"));
