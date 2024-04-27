import{U as a}from"./UWAL-DFLFQeyv.js";var m=`@vertex fn vertex(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f
{
    let position = array(
        vec2f( 0.0,  0.5), 
        vec2f(-0.5, -0.5), 
        vec2f( 0.5, -0.5)  
    );

    return vec4f(position[index], 0.0, 1.0);
}

@fragment fn fragment() -> @location(0) vec4f
{
    return vec4f(1.0, 0.0, 0.0, 1.0);
}`,g=`@group(0) @binding(0) var<storage, read_write> data: array<f32>;

@compute @workgroup_size(1)
fn compute(@builtin(global_invocation_id) id: vec3u)
{
    let i = id.x;
    data[i] *= 2;
}`;/**
 * @module Fundamentals
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Fundamentals
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-fundamentals.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future releases thanks to new library APIs.
 * @version 0.0.2
 * @license MIT
 */(async function(i){{let d=function(){a.SetCanvasSize(i.width,i.height),n.colorAttachments[0].view=a.CurrentTextureView,t.Render(n,f,3)},t;try{t=new(await a.RenderPipeline(i,"Red Triangle Encoder"))}catch(o){alert(o)}const e=t.CreateColorAttachment(void 0,"clear","store",[.3,.3,.3,1]),n=t.CreateRenderPassDescriptor([e],"Red Triangle Render Pass"),u=t.CreateShaderModule(m,"Red Triangle Shader"),s=t.CreateVertexState(u),l=t.CreateFragmentState(u),f=t.CreateRenderPipeline({label:"Red Triangle Pipeline",vertex:s,fragment:l});new ResizeObserver(o=>{for(const c of o){const{inlineSize:p,blockSize:C}=c.contentBoxSize[0];a.SetCanvasSize(p,C)}d()}).observe(i)}{const t=new Float32Array([1,3,5]),e=new(await a.ComputePipeline("Double Compute Encoder")),n=e.CreateBuffer({label:"Double Compute Buffer",size:t.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST});e.WriteBuffer(n,t);const u=e.CreateShaderModule(g,"Double Compute Shader"),s=e.CreateComputePipeline({label:"Double Compute Pipeline",module:u}),l=e.CreateBindGroupEntries({buffer:n}),f=e.CreateBindGroup({layout:s.getBindGroupLayout(0),label:"Compute Buffer Bind Group",entries:l});e.AddBindGroups(f),e.CreateCommandEncoder();const d=e.CreateComputePassDescriptor("Double Compute Pass");e.Workgroups=t.length,e.Compute(s,d);const r=e.CreateBuffer({label:"Double Result Buffer",size:t.byteLength,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST});e.CopyBufferToBuffer(n,r,r.size),e.SubmitCommandBuffer(),await r.mapAsync(GPUMapMode.READ);const o=new Float32Array(r.getMappedRange());console.info("Input:",...t),console.info("Result:",...o),r.unmap()}})(document.getElementById("lesson"));
