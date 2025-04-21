import{U as S,C as l,F as s,A as a}from"./index-DEQUc6k7.js";import{g as w}from"./mipmaps-kMQ0t0FP.js";import{Q as L}from"./Quad-D4MTv-Aj.js";var N=`struct Transform
{
    scale: vec2f,
    offset: vec2f
};

struct VertexOutput
{
    @builtin(position) position: vec4f,
    @location(0) textureCoord: vec2f
};

@group(0) @binding(0) var Sampler: sampler;
@group(0) @binding(1) var Texture: texture_2d<f32>;
@group(0) @binding(2) var<uniform> transform: Transform;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput
{
    var output: VertexOutput;
    var position = GetQuadCoord(index);

    
    position = (position + 1) * 0.5;

    output.position = vec4f(
        position *
        transform.scale +
        transform.offset,
        0.0, 1.0
    );

    output.textureCoord = position;

    return output;
}

@fragment fn fragment(@location(0) textureCoord: vec2f) -> @location(0) vec4f
{
    return textureSample(Texture, Sampler, textureCoord);
}`;/**
 * @module Textures
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Textures
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-textures.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.5
 * @license MIT
 */(async function(d){let r;try{r=new(await S.RenderPipeline(d,"Texture"))}catch(t){alert(t)}r.CreatePipeline({module:r.CreateShaderModule([L,N])});const A=r.CreateColorAttachment();A.clearValue=new l(5000268).rgba,r.CreatePassDescriptor(A);const B=5,v=0,M=2,n={addressModeU:a.REPEAT,addressModeV:a.REPEAT,magFilter:s.LINEAR,minFilter:s.LINEAR,scale:1},R=[a.REPEAT,a.CLAMP],T=[s.NEAREST,s.LINEAR],u=new GUI;u.add(n,"addressModeU",R),u.add(n,"addressModeV",R),u.add(n,"magFilter",T),u.add(n,"minFilter",T),u.add(n,"scale",.5,6);const e=new l(16711680).RGBA,i=new l(16776960).RGBA,U=new l(255).RGBA,b=new Uint8Array([e,e,e,e,e,e,i,e,e,e,e,i,e,e,e,e,i,i,e,e,e,i,e,e,e,e,i,i,i,e,U,e,e,e,e].flat()),c=w(b,B),m=new(await S.Texture()),g=m.CreateTexture({usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST,size:[c[0].width,c[0].height],mipLevelCount:c.length,format:"rgba8unorm"});c.forEach(({data:t,width:o,height:f},p)=>m.WriteTexture(t,{bytesPerRow:o*4,texture:g,mipLevel:p,width:o,height:f}));const x=2*Float32Array.BYTES_PER_ELEMENT+2*Float32Array.BYTES_PER_ELEMENT,C=r.CreateBuffer({size:x,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),E=new Float32Array(x/Float32Array.BYTES_PER_ELEMENT);for(let t=0;t<16;t++){const o=m.CreateSampler({addressModeU:t&1?a.REPEAT:a.CLAMP,addressModeV:t&2?a.REPEAT:a.CLAMP,magFilter:t&4?s.LINEAR:s.NEAREST,minFilter:t&8?s.LINEAR:s.NEAREST});r.AddBindGroups(r.CreateBindGroup(r.CreateBindGroupEntries([o,g.createView(),{buffer:C}])))}function F(t){const o=4/d.width*n.scale,f=4/d.height*n.scale;E.set([o,f],v),E.set([Math.sin(t*.25)*.8,-.8],M),r.WriteBuffer(C,E)}function P(t){const o=+(n.addressModeU===a.REPEAT)*1+ +(n.addressModeV===a.REPEAT)*2+ +(n.magFilter===s.LINEAR)*4+ +(n.minFilter===s.LINEAR)*8;r.SetActiveBindGroups(o),F(t*.001),r.Render(6),requestAnimationFrame(P)}new ResizeObserver(t=>{for(const o of t){const{inlineSize:f,blockSize:p}=o.contentBoxSize[0];r.SetCanvasSize(f/64|0,p/64|0,!1)}requestAnimationFrame(P)}).observe(document.body),d.style.imageRendering="pixelated",d.style.imageRendering="crisp-edges"})(document.getElementById("lesson"));
