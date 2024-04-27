import{U as s}from"./UWAL-DFLFQeyv.js";var R=`struct ConstStruct
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
 * may be simplified in future releases thanks to new library APIs.
 * @version 0.0.2
 * @license MIT
 */(async function(a){let e;try{e=new(await s.RenderPipeline(a,"Triangle Uniforms Encoder"))}catch(r){alert(r)}const v=e.CreateColorAttachment(void 0,"clear","store",[.3,.3,.3,1]),d=e.CreateRenderPassDescriptor([v],"Triangle Uniforms Render Pass"),E=e.CreateShaderModule(R,"Triangle Shader Uniforms"),U=e.CreateVertexState(E),g=e.CreateFragmentState(E),S=e.CreateRenderPipeline({label:"Triangle Uniforms Pipeline",vertex:U,fragment:g}),p=0,b=4,m=4*Float32Array.BYTES_PER_ELEMENT+2*Float32Array.BYTES_PER_ELEMENT+2*Float32Array.BYTES_PER_ELEMENT,C=0,B=2*Float32Array.BYTES_PER_ELEMENT,T=100,c=[];for(let r=0;r<T;++r){const t=e.CreateBuffer({label:`Constant Uniform Object[${r}]`,size:m,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});{const l=new Float32Array(m/Float32Array.BYTES_PER_ELEMENT);l.set([n(),n(),n(),1],p),l.set([n(-.9,.9),n(-.9,.9)],b),e.WriteBuffer(t,l)}const o=new Float32Array(B/Float32Array.BYTES_PER_ELEMENT),f=e.CreateBuffer({label:`Variable Uniform Object[${r}]`,size:B,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),u=e.CreateBindGroupEntries([{buffer:t},{buffer:f}]),i=e.CreateBindGroup({layout:S.getBindGroupLayout(0),label:"Uniform Buffer Bind Group",entries:u});c.push({uniformBuffer:f,scale:n(.2,.5),uniformValues:o,bindGroup:i})}function n(r=0,t=1){return t===void 0&&(t=r,r=0),Math.random()*(t-r)+r}function P(){s.SetCanvasSize(a.width,a.height);const r=s.AspectRatio;d.colorAttachments[0].view=s.CurrentTextureView;for(const[t,{scale:o,bindGroup:f,uniformBuffer:u,uniformValues:i}]of c.entries())i.set([o/r,o],C),e.AddBindGroups(f),e.WriteBuffer(u,i),e.Render(d,S,3,t===c.length-1)}new ResizeObserver(r=>{for(const t of r){const{inlineSize:o,blockSize:f}=t.contentBoxSize[0];s.SetCanvasSize(o,f)}P()}).observe(a)})(document.getElementById("lesson"));
