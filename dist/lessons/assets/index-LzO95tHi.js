import{D as g}from"./Double-BEL1I5kG.js";import{U as f,C as l}from"./index-DEQUc6k7.js";import{Q as C}from"./Quad-D4MTv-Aj.js";var m=`@group(0) @binding(0) var<storage, read_write> src0: array<f32>;\r
@group(0) @binding(1) var<storage, read_write> src1: array<f32>;\r
@group(0) @binding(2) var<storage, read_write> dst: array<f32>;

@compute @workgroup_size(1)\r
fn compute(@builtin(global_invocation_id) id: vec3u)\r
{\r
    let i = id.x;\r
    dst[i] = src0[i] + src1[i];\r
}`,y=`@group(0) @binding(0) var<storage, read_write> data: array<f32>;

@compute @workgroup_size(1)
fn compute(@builtin(global_invocation_id) id: vec3u)
{
    let i = id.x;
    data[i] = data[i] + 3.0;
}`,B=`struct VertexOutput\r
{\r
    @builtin(position) position: vec4f,\r
    @location(0) textureCoord: vec2f\r
};

@group(0) @binding(0) var Sampler: sampler;\r
@group(0) @binding(1) var Texture: texture_2d<f32>;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput\r
{\r
    var output: VertexOutput;\r
    var position = GetQuadCoord(index);

    
    position = (position + 1) * 0.5;

    output.position = vec4f(position, 0.0, 1.0);

    output.textureCoord = position;

    return output;\r
}

@fragment fn fragment(@location(0) textureCoord: vec2f) -> @location(0) vec4f\r
{\r
    return textureSample(Texture, Sampler, textureCoord);\r
}`;/**
 * @module Bind Group Layouts
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Bind Group Layouts
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-bind-group-layouts.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.9
 * @license MIT
 */(async function(p){let n,e;try{n=new(await f.RenderPipeline(p,"Bind Group Layouts")),e=new(await f.ComputePipeline(p,"Dynamic Offsets"))}catch(r){alert(r)}{const r=new(await f.Texture()),o=5,a=n.CreateColorAttachment();a.clearValue=new l(5000268).rgba,n.CreatePassDescriptor(a);const i=r.CreateSampler(),s=r.CreateTexture({format:"rgba32float",size:[o,7]}),t=new l(16711680).RGBA,u=new l(16776960).RGBA,d=new l(255).RGBA,c=new Float32Array([d,t,t,t,t,t,u,u,u,t,t,u,t,t,t,t,u,u,t,t,t,u,t,t,t,t,u,t,t,t,t,t,t,t,t].flat());r.WriteTexture(c,{texture:s,bytesPerRow:o*4*4}),n.CreatePipeline({module:n.CreateShaderModule([C,B]),layout:n.CreatePipelineLayout(n.CreateBindGroupLayout([n.CreateSamplerBindingLayout("non-filtering"),n.CreateTextureBindingLayout("unfilterable-float")]))}),n.SetBindGroups(n.CreateBindGroup(n.CreateBindGroupEntries([i,s.createView()])))}{e.CreatePipeline({module:e.CreateShaderModule(m),layout:e.CreatePipelineLayout(e.CreateBindGroupLayout(Array.from({length:3}).fill(e.CreateBufferBindingLayout("storage",!0))))});const r=new Float32Array(64*3);r.set([1,3,5]),r.set([11,12,13],64);const o=e.CreateBuffer({usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST,size:r.byteLength}),a=e.CreateReadableBuffer(r.byteLength);e.WriteBuffer(o,r),e.SetBindGroups(e.CreateBindGroup(e.CreateBindGroupEntries(Array.from({length:3}).fill({buffer:o,size:256}))),[0,256,512]),e.Workgroups=3,e.Compute(),e.CopyBufferToBuffer(o,a),e.Submit(),await a.mapAsync(GPUMapMode.READ);const i=new Float32Array(a.getMappedRange());console.log("src0:",r.slice(0,3)),console.log("src1:",r.slice(64,67)),console.log("dst:",i.slice(128,131)),a.unmap()}{const r=e.CreateBindGroupLayout(e.CreateBufferBindingLayout("storage")),o=e.CreatePipelineLayout(r),a=e.CreatePipeline({module:e.CreateShaderModule(y),layout:o});e.CreatePipeline({module:e.CreateShaderModule(g),layout:o});const i=new Float32Array([1,3,5]),s=e.CreateBuffer({usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST,size:i.byteLength});e.WriteBuffer(s,i);const t=e.CreateReadableBuffer(i.byteLength);e.SetBindGroups(e.CreateBindGroup(e.CreateBindGroupEntries({buffer:s}))),e.Workgroups=i.length,e.Compute(),e.SetPipeline(a),e.Compute(),e.CopyBufferToBuffer(s,t),e.Submit(),await t.mapAsync(GPUMapMode.READ);const u=new Float32Array(t.getMappedRange());console.log("input:",i),console.log("result:",u),t.unmap()}new ResizeObserver(r=>{for(const o of r){const{inlineSize:a,blockSize:i}=o.contentBoxSize[0];n.SetCanvasSize(a,i)}n.Render(6)}).observe(document.body)})(document.getElementById("lesson"));
