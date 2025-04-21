import{U as g}from"./index-DEQUc6k7.js";var C=`struct ConstStruct
{
    color: vec4f,
    offset: vec2f
};

struct VarStruct
{
    scale: vec2f
};

@group(0) @binding(0) var<uniform> constStruct: ConstStruct;
@group(0) @binding(1) var<uniform> varStruct: VarStruct;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f
{
    let position = array(
        vec2f( 0.0,  0.5), 
        vec2f(-0.5, -0.5), 
        vec2f( 0.5, -0.5)  
    );

    return vec4f(position[index] * varStruct.scale + constStruct.offset, 0.0, 1.0);
}

@fragment fn fragment() -> @location(0) vec4f
{
    return constStruct.color;
}`;/**
 * @module Uniforms
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Uniforms
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-uniforms.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.4
 * @license MIT
 */(async function(a){let e;try{e=new(await g.RenderPipeline(a,"Triangle Uniforms"))}catch(r){alert(r)}const E=0,S=4,B=0,v=100,c=[],m=e.CreatePassDescriptor(e.CreateColorAttachment(void 0,"clear","store",[.3,.3,.3,1])),u=e.CreateShaderModule(C);e.CreatePipeline({vertex:e.CreateVertexState(u),fragment:e.CreateFragmentState(u)});const l=4*Float32Array.BYTES_PER_ELEMENT+2*Float32Array.BYTES_PER_ELEMENT+2*Float32Array.BYTES_PER_ELEMENT,d=2*Float32Array.BYTES_PER_ELEMENT;for(let r=0;r<v;++r){const t=e.CreateBuffer({label:`Triangle Uniforms Constant Buffer[${r}]`,size:l,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});{const i=new Float32Array(l/Float32Array.BYTES_PER_ELEMENT);i.set([n(),n(),n(),1],E),i.set([n(-.9,.9),n(-.9,.9)],S),e.WriteBuffer(t,i)}const f=new Float32Array(d/Float32Array.BYTES_PER_ELEMENT),o=e.CreateBuffer({label:`Triangle Uniforms Variable Buffer[${r}]`,size:d,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),s=e.CreateBindGroup(e.CreateBindGroupEntries([{buffer:t},{buffer:o}]));c.push({uniformBuffer:o,scale:n(.2,.5),uniformValues:f,bindGroup:s})}function n(r,t){return r===void 0?(r=0,t=1):t===void 0&&(t=r,r=0),Math.random()*(t-r)+r}function b(){e.SetCanvasSize(a.width,a.height);const r=e.AspectRatio;m.colorAttachments[0].view=e.CurrentTextureView;for(const{scale:t,bindGroup:f,uniformBuffer:o,uniformValues:s}of c.values())s.set([t/r,t],B),e.SetBindGroups(f),e.WriteBuffer(o,s),e.Render(3,!1);e.Submit()}new ResizeObserver(r=>{for(const t of r){const{inlineSize:f,blockSize:o}=t.contentBoxSize[0];e.SetCanvasSize(f,o)}b()}).observe(document.body)})(document.getElementById("lesson"));
