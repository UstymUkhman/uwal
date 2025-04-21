import{U as B}from"./index-DEQUc6k7.js";var S=`@group(0) @binding(0) var<uniform> resolution: vec3f;

fn GetClipSpace(position: vec2f) -> vec2f
{
    
    let clipSpace = position / resolution.xy * 2 - 1;

    
    return clipSpace * vec2f(1, -1);
}`,b=`struct Uniforms
{
    color: vec4f,
    translation: vec2f
};

@group(0) @binding(1) var<uniform> uniforms: Uniforms;

@vertex fn vertex(@location(0) position: vec2f) -> @builtin(position) vec4f
{
    let clipSpace = GetClipSpace(position + uniforms.translation);
    return vec4f(clipSpace, 0.0, 1.0);
}

@fragment fn fragment() -> @location(0) vec4f
{
    return uniforms.color;
}`;function y(){const n=new Float32Array([0,0,30,0,0,150,30,150,30,0,100,0,30,30,100,30,30,60,70,60,30,90,70,90]),e=new Uint32Array([0,1,2,2,1,3,4,5,6,6,5,7,8,9,10,10,9,11]);return{vertices:e.length,vertexData:n,indexData:e}}/**
 * @module Translation
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Translation
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-translation.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.10
 * @license MIT
 */(async function(n){let e;n.style.backgroundPosition="-1.5px -1.5px, -1.5px -1.5px, -1px -1px, -1px -1px",n.style.backgroundSize="100px 100px, 100px 100px, 10px 10px, 10px 10px",n.style.backgroundColor="#000000",n.style.backgroundImage=`
        linear-gradient(       #666 1.5px, transparent 1.5px),
        linear-gradient(90deg, #666 1.5px, transparent 1.5px),
        linear-gradient(       #333 1px,   transparent 1px),
        linear-gradient(90deg, #333 1px,   transparent 1px)
    `;try{e=new(await B.RenderPipeline(n,"Translation",{alphaMode:"premultiplied"}))}catch(a){alert(a)}const i=new GUI().onChange(c),r={translation:[0,0]};i.add(r.translation,"0",0,1e3).name("translation.x"),i.add(r.translation,"1",0,1e3).name("translation.y");const f=e.CreateShaderModule([S,b]),{uniforms:t,buffer:o}=e.CreateUniformBuffer("uniforms");t.color.set([Math.random(),Math.random(),Math.random(),1]);const{vertexData:s,indexData:l,vertices:d}=y(),p=e.CreateIndexBuffer(l),{buffer:u,layout:x}=e.CreateVertexBuffer("position",s.length/2);e.WriteBuffer(o,t.color),e.WriteBuffer(u,s),e.WriteBuffer(p,l),e.SetVertexBuffers(u),e.SetIndexBuffer(p),e.CreatePipeline({vertex:e.CreateVertexState(f,void 0,x),fragment:e.CreateFragmentState(f)}),e.SetBindGroups(e.CreateBindGroup(e.CreateBindGroupEntries([{buffer:e.ResolutionBuffer},{buffer:o}])));function c(){t.translation.set(r.translation),e.WriteBuffer(o,t.translation,16),e.Render(d)}new ResizeObserver(a=>{for(const m of a){const{inlineSize:g,blockSize:v}=m.contentBoxSize[0];e.SetCanvasSize(g,v)}c()}).observe(document.body)})(document.getElementById("lesson"));
