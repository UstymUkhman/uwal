import{U as s}from"./index-PE54gEXK.js";var T="struct ConstStruct{color: vec4f,offset: vec2f};struct VarStruct{scale: vec2f};@group(0)@binding(0)var<uniform>constStruct: ConstStruct;@group(0)@binding(1)var<uniform>varStruct: VarStruct;@vertex fn vertex(@builtin(vertex_index)index: u32)->@builtin(position)vec4f {let position=array(vec2f(0.0,0.5),vec2f(-0.5,-0.5),vec2f(0.5,-0.5));return vec4f(position[index]*varStruct.scale+constStruct.offset,0.0,1.0);}@fragment fn fragment()->@location(0)vec4f {return constStruct.color;}";/**
 * @module Uniforms
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Uniforms
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-uniforms.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.3
 * @license MIT
 */(async function(a){let e;try{e=new(await s.RenderPipeline(a,"Triangle Uniforms"))}catch(r){alert(r)}const m=0,g=4,p=0,C=100,c=[],E=e.CreateRenderPassDescriptor(e.CreateColorAttachment(void 0,"clear","store",[.3,.3,.3,1])),d=e.CreateShaderModule(T),S=e.CreateRenderPipeline({vertex:e.CreateVertexState(d),fragment:e.CreateFragmentState(d)}),B=4*Float32Array.BYTES_PER_ELEMENT+2*Float32Array.BYTES_PER_ELEMENT+2*Float32Array.BYTES_PER_ELEMENT,v=2*Float32Array.BYTES_PER_ELEMENT;for(let r=0;r<C;++r){const t=e.CreateBuffer({label:`Triangle Uniforms Constant Buffer[${r}]`,size:B,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});{const l=new Float32Array(B/Float32Array.BYTES_PER_ELEMENT);l.set([n(),n(),n(),1],m),l.set([n(-.9,.9),n(-.9,.9)],g),e.WriteBuffer(t,l)}const o=new Float32Array(v/Float32Array.BYTES_PER_ELEMENT),f=e.CreateBuffer({label:`Triangle Uniforms Variable Buffer[${r}]`,size:v,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),u=e.CreateBindGroupEntries([{buffer:t},{buffer:f}]),i=e.CreateBindGroup({layout:S.getBindGroupLayout(0),entries:u});c.push({uniformBuffer:f,scale:n(.2,.5),uniformValues:o,bindGroup:i})}function n(r=0,t=1){return t===void 0&&(t=r,r=0),Math.random()*(t-r)+r}function U(){s.SetCanvasSize(a.width,a.height);const r=s.AspectRatio;E.colorAttachments[0].view=s.CurrentTextureView;for(const[t,{scale:o,bindGroup:f,uniformBuffer:u,uniformValues:i}]of c.entries())i.set([o/r,o],p),e.SetBindGroups(f),e.WriteBuffer(u,i),e.Render(E,S,3,t===c.length-1)}new ResizeObserver(r=>{for(const t of r){const{inlineSize:o,blockSize:f}=t.contentBoxSize[0];s.SetCanvasSize(o,f)}U()}).observe(a)})(document.getElementById("lesson"));