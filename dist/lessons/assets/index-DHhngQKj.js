import{R as b,c as S}from"./F-2HJQJ1w3.js";import{U as y,a as C}from"./index-DEQUc6k7.js";var h=`struct Uniforms
{
    color: vec4f,
    translation: vec2f,
    rotation: vec2f,
    scale: vec2f
};

@group(0) @binding(1) var<uniform> uniforms: Uniforms;

@vertex fn vertex(@location(0) position: vec2f) -> @builtin(position) vec4f
{
    
    let scaledPosition = position * uniforms.scale;

    
    let rotatedPosition = vec2f(
        scaledPosition.x * uniforms.rotation.x - scaledPosition.y * uniforms.rotation.y,
        scaledPosition.x * uniforms.rotation.y + scaledPosition.y * uniforms.rotation.x
    );

    
    let clipSpace = GetClipSpace(rotatedPosition + uniforms.translation);
    return vec4f(clipSpace, 0.0, 1.0);
}

@fragment fn fragment() -> @location(0) vec4f
{
    return uniforms.color;
}`;/**
 * @module Scale
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Scale
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-scale.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.11
 * @license MIT
 */(async function(r){let e;r.style.backgroundPosition="-1.5px -1.5px, -1.5px -1.5px, -1px -1px, -1px -1px",r.style.backgroundSize="100px 100px, 100px 100px, 10px 10px, 10px 10px",r.style.backgroundColor="#000",r.style.backgroundImage=`
        linear-gradient(       #666 1.5px, transparent 1.5px),
        linear-gradient(90deg, #666 1.5px, transparent 1.5px),
        linear-gradient(       #333 1px,   transparent 1px),
        linear-gradient(90deg, #333 1px,   transparent 1px)
    `;try{e=new(await y.RenderPipeline(r,"Scale",{alphaMode:"premultiplied"}))}catch(i){alert(i)}const o=new GUI().onChange(u),n={translation:[0,0],rotation:C.DegreesToRadians(30),scale:[1,1]},p={min:-360,max:360,step:1,converters:GUI.converters.radToDeg};o.add(n.translation,"0",0,1e3).name("translation.x"),o.add(n.translation,"1",0,1e3).name("translation.y"),o.add(n,"rotation",p),o.add(n.scale,"0",-5,5).name("scale.x"),o.add(n.scale,"1",-5,5).name("scale.y");const s=e.CreateShaderModule([b,h]),{uniforms:t,buffer:a}=e.CreateUniformBuffer("uniforms");t.color.set([Math.random(),Math.random(),Math.random(),1]);const{vertexData:f,indexData:l,vertices:x}=S(),c=e.CreateIndexBuffer(l),{buffer:d,layout:m}=e.CreateVertexBuffer("position",f.length/2);e.WriteBuffer(a,t.color),e.WriteBuffer(d,f),e.WriteBuffer(c,l),e.SetVertexBuffers(d),e.SetIndexBuffer(c),e.CreatePipeline({vertex:e.CreateVertexState(s,void 0,m),fragment:e.CreateFragmentState(s)}),e.SetBindGroups(e.CreateBindGroup(e.CreateBindGroupEntries([{buffer:e.ResolutionBuffer},{buffer:a}])));function u(){t.translation.set(n.translation),t.rotation.set([Math.cos(n.rotation),Math.sin(n.rotation)]),t.scale.set(n.scale),e.WriteBuffer(a,t.scale.buffer),e.Render(x)}new ResizeObserver(i=>{for(const g of i){const{inlineSize:v,blockSize:B}=g.contentBoxSize[0];e.SetCanvasSize(v,B)}u()}).observe(document.body)})(document.getElementById("lesson"));
