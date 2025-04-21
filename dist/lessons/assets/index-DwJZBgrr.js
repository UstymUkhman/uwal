import{R as b,c as y}from"./F-2HJQJ1w3.js";import{U as S,a as C}from"./index-DEQUc6k7.js";var h=`struct Uniforms
{
    color: vec4f,
    translation: vec2f,
    rotation: vec2f
};

@group(0) @binding(1) var<uniform> uniforms: Uniforms;

@vertex fn vertex(@location(0) position: vec2f) -> @builtin(position) vec4f
{
    
    let rotatedPosition = vec2f(
        position.x * uniforms.rotation.x - position.y * uniforms.rotation.y,
        position.x * uniforms.rotation.y + position.y * uniforms.rotation.x
    );

    
    let clipSpace = GetClipSpace(rotatedPosition + uniforms.translation);
    return vec4f(clipSpace, 0.0, 1.0);
}

@fragment fn fragment() -> @location(0) vec4f
{
    return uniforms.color;
}`;/**
 * @module Rotation
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Rotation
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-rotation.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.11
 * @license MIT
 */(async function(n){let e;n.style.backgroundPosition="-1.5px -1.5px, -1.5px -1.5px, -1px -1px, -1px -1px",n.style.backgroundSize="100px 100px, 100px 100px, 10px 10px, 10px 10px",n.style.backgroundColor="#000",n.style.backgroundImage=`
        linear-gradient(       #666 1.5px, transparent 1.5px),
        linear-gradient(90deg, #666 1.5px, transparent 1.5px),
        linear-gradient(       #333 1px,   transparent 1px),
        linear-gradient(90deg, #333 1px,   transparent 1px)
    `;try{e=new(await S.RenderPipeline(n,"Rotation",{alphaMode:"premultiplied"}))}catch(a){alert(a)}const o=new GUI().onChange(d),t={translation:[0,0],rotation:C.DegreesToRadians(30)},c={min:-360,max:360,step:1,converters:GUI.converters.radToDeg};o.add(t.translation,"0",0,1e3).name("translation.x"),o.add(t.translation,"1",0,1e3).name("translation.y"),o.add(t,"rotation",c);const s=e.CreateShaderModule([b,h]),{uniforms:r,buffer:i}=e.CreateUniformBuffer("uniforms");r.color.set([Math.random(),Math.random(),Math.random(),1]);const{vertexData:f,indexData:p,vertices:x}=y(),u=e.CreateIndexBuffer(p),{buffer:l,layout:m}=e.CreateVertexBuffer("position",f.length/2);e.WriteBuffer(i,r.color),e.WriteBuffer(l,f),e.WriteBuffer(u,p),e.SetVertexBuffers(l),e.SetIndexBuffer(u),e.CreatePipeline({vertex:e.CreateVertexState(s,void 0,m),fragment:e.CreateFragmentState(s)}),e.SetBindGroups(e.CreateBindGroup(e.CreateBindGroupEntries([{buffer:e.ResolutionBuffer},{buffer:i}])));function d(){r.translation.set(t.translation),r.rotation.set([Math.cos(t.rotation),Math.sin(t.rotation)]),e.WriteBuffer(i,r.rotation.buffer),e.Render(x)}new ResizeObserver(a=>{for(const g of a){const{inlineSize:v,blockSize:B}=g.contentBoxSize[0];e.SetCanvasSize(v,B)}d()}).observe(document.body)})(document.getElementById("lesson"));
