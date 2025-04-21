import{U as c,C as T,F as o,A as r}from"./index-DEQUc6k7.js";import{F as C}from"./f-CdSZvatx.js";import{Q as R}from"./Quad-D4MTv-Aj.js";var v=`struct VertexOutput
{
    @builtin(position) position: vec4f,
    @location(0) textureCoord: vec2f
};

@group(0) @binding(0) var Sampler: sampler;
@group(0) @binding(1) var Texture: texture_2d<f32>;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput
{
    var output: VertexOutput;
    var position = GetQuadCoord(index);

    
    position = (position + 1) * 0.5;

    output.position = vec4f(position, 0.0, 1.0);
    output.textureCoord = position;

    return output;
}

@fragment fn fragment(@location(0) textureCoord: vec2f) -> @location(0) vec4f
{
    return textureSample(Texture, Sampler, textureCoord);
}`;/**
 * @module Loading Images
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Loading Images into Textures
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-importing-textures.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.5
 * @license MIT
 */(async function(p){let t;try{t=new(await c.RenderPipeline(p,"Loading Images"))}catch(e){alert(e)}t.CreatePipeline({module:t.CreateShaderModule([R,v])});const d=t.CreateColorAttachment();d.clearValue=new T(5000268).rgba,t.CreatePassDescriptor(d);const n={addressModeU:r.REPEAT,addressModeV:r.REPEAT,magFilter:o.LINEAR},u=[r.REPEAT,r.CLAMP],l=[o.NEAREST,o.LINEAR],a=new GUI;a.add(n,"addressModeU",u),a.add(n,"addressModeV",u),a.add(n,"magFilter",l),Object.assign(a.domElement.style,{left:"15px",right:""});const m=async e=>await s.CreateBitmapImage(await(await fetch(e)).blob(),{colorSpaceConversion:"none"}),s=new(await c.Texture()),E=await m(C),g=s.CopyImageToTexture(E,{flipY:!0,create:{usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST,format:"rgba8unorm",mipmaps:!1}});for(let e=0;e<8;e++){const i=s.CreateSampler({addressModeU:e&1?r.REPEAT:r.CLAMP,addressModeV:e&2?r.REPEAT:r.CLAMP,magFilter:e&4?o.LINEAR:o.NEAREST});t.AddBindGroups(t.CreateBindGroup(t.CreateBindGroupEntries([i,g.createView()])))}function x(){const e=+(n.addressModeU===r.REPEAT)*1+ +(n.addressModeV===r.REPEAT)*2+ +(n.magFilter===o.LINEAR)*4;t.SetActiveBindGroups(e),t.Render(6)}new ResizeObserver(e=>{for(const i of e){const{inlineSize:f,blockSize:A}=i.contentBoxSize[0];t.SetCanvasSize(f,A)}x()}).observe(document.body)})(document.getElementById("lesson"));
