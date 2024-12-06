import{U as u}from"./index-GPjqY_Dq.js";import{D as l}from"./Double-CmGtA-HF.js";var d="@vertex fn vertex(@builtin(vertex_index)index: u32)->@builtin(position)vec4f {let position=array(vec2f(0.0,0.5),vec2f(-0.5,-0.5),vec2f(0.5,-0.5));return vec4f(position[index],0.0,1.0);}@fragment fn fragment()->@location(0)vec4f {return vec4f(1.0,0.0,0.0,1.0);}";/**
 * @module Fundamentals
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Fundamentals
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-fundamentals.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.4
 * @license MIT
 */(async function(o){{let a=function(){e.SetCanvasSize(o.width,o.height),t.colorAttachments[0].view=e.CurrentTextureView,e.Render(3)},e;try{e=new(await u.RenderPipeline(o,"Red Triangle"))}catch(r){alert(r)}const t=e.CreatePassDescriptor(e.CreateColorAttachment(void 0,"clear","store",[.3,.3,.3,1])),n=e.CreateShaderModule(d);e.CreatePipeline({vertex:e.CreateVertexState(n),fragment:e.CreateFragmentState(n)}),new ResizeObserver(r=>{for(const i of r){const{inlineSize:f,blockSize:c}=i.contentBoxSize[0];e.SetCanvasSize(f,c)}a()}).observe(o)}{const e=new Float32Array([1,3,5]),t=new(await u.ComputePipeline("Double Compute")),n=t.CreateBuffer({size:e.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST});t.WriteBuffer(n,e);const a=t.CreateShaderModule(l);t.CreatePipeline({module:a});const s=t.CreateBindGroup(t.CreateBindGroupEntries({buffer:n}));t.CreatePassDescriptor(),t.SetBindGroups(s),t.Workgroups=e.length,t.Compute();const r=t.CreateBuffer({size:e.byteLength,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST});t.CopyBufferToBuffer(n,r,r.size),t.SubmitCommandBuffer(),await r.mapAsync(GPUMapMode.READ);const i=new Float32Array(r.getMappedRange());console.info("Input:",...e),console.info("Result:",...i),r.unmap()}})(document.getElementById("lesson"));