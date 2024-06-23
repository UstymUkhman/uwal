import{U as S,A as n,F as a}from"./index-DUOumvAP.js";import{g as w}from"./mipmaps-kMQ0t0FP.js";import{Q as L,C as l}from"./Quad-C4zpvK4p.js";var N="struct Transform{scale: vec2f,offset: vec2f};struct VertexOutput{@builtin(position)position: vec4f,@location(0)textureCoord: vec2f};@group(0)@binding(0)var Sampler: sampler;@group(0)@binding(1)var Texture: texture_2d<f32>;@group(0)@binding(2)var<uniform>transform: Transform;@vertex fn vertex(@builtin(vertex_index)index: u32)->VertexOutput {var output: VertexOutput;var position=GetQuadCoord(index);position=(position+1)*0.5;output.position=vec4f(position*transform.scale+transform.offset,0.0,1.0);output.textureCoord=position;return output;}@fragment fn fragment(@location(0)textureCoord: vec2f)->@location(0)vec4f {return textureSample(Texture,Sampler,textureCoord);}";/**
 * @module Textures
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Textures
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-textures.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.5
 * @license MIT
 */(async function(u){let r;try{r=new(await S.RenderPipeline(u,"Texture"))}catch(t){alert(t)}r.CreatePipeline({module:r.CreateShaderModule([L,N])});const A=r.CreateColorAttachment();A.clearValue=new l(5000268).rgba,r.CreatePassDescriptor(A);const B=5,v=0,M=2,o={addressModeU:n.REPEAT,addressModeV:n.REPEAT,magFilter:a.LINEAR,minFilter:a.LINEAR,scale:1},R=[n.REPEAT,n.CLAMP],T=[a.NEAREST,a.LINEAR],d=new GUI;d.add(o,"addressModeU",R),d.add(o,"addressModeV",R),d.add(o,"magFilter",T),d.add(o,"minFilter",T),d.add(o,"scale",.5,6);const e=new l(16711680).RGBA,i=new l(16776960).RGBA,U=new l(255).RGBA,F=new Uint8Array([e,e,e,e,e,e,i,e,e,e,e,i,e,e,e,e,i,i,e,e,e,i,e,e,e,e,i,i,i,e,U,e,e,e,e].flat()),c=w(F,B),m=new(await S.Texture()),g=m.CreateTexture({usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST,size:[c[0].width,c[0].height],mipLevelCount:c.length,format:"rgba8unorm"});c.forEach(({data:t,width:s,height:f},p)=>m.WriteTexture(t,{bytesPerRow:s*4,texture:g,mipLevel:p,width:s,height:f}));const x=2*Float32Array.BYTES_PER_ELEMENT+2*Float32Array.BYTES_PER_ELEMENT,C=r.CreateBuffer({size:x,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),E=new Float32Array(x/Float32Array.BYTES_PER_ELEMENT);for(let t=0;t<16;t++){const s=m.CreateSampler({addressModeU:t&1?n.REPEAT:n.CLAMP,addressModeV:t&2?n.REPEAT:n.CLAMP,magFilter:t&4?a.LINEAR:a.NEAREST,minFilter:t&8?a.LINEAR:a.NEAREST});r.AddBindGroups(r.CreateBindGroup(r.CreateBindGroupEntries([s,g.createView(),{buffer:C}])))}function b(t){const s=4/u.width*o.scale,f=4/u.height*o.scale;E.set([s,f],v),E.set([Math.sin(t*.25)*.8,-.8],M),r.WriteBuffer(C,E)}function P(t){const s=+(o.addressModeU===n.REPEAT)*1+ +(o.addressModeV===n.REPEAT)*2+ +(o.magFilter===a.LINEAR)*4+ +(o.minFilter===a.LINEAR)*8;r.SetActiveBindGroups(s),b(t*.001),r.Render(6),requestAnimationFrame(P)}new ResizeObserver(t=>{for(const s of t){const{inlineSize:f,blockSize:p}=s.contentBoxSize[0];r.SetCanvasSize(f/64|0,p/64|0)}requestAnimationFrame(P)}).observe(u),u.style.imageRendering="pixelated",u.style.imageRendering="crisp-edges"})(document.getElementById("lesson"));
