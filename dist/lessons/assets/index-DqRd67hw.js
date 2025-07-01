import{D as b,U as y}from"./index-Dm8t6IxS.js";import{c as S}from"./F-CZA4EI5f.js";import{R as C}from"./Resolution-Cnr3CPX7.js";var h="struct Uniforms{color: vec4f,translation: vec2f,rotation: vec2f};@group(0)@binding(1)var<uniform>uniforms: Uniforms;@vertex fn vertex(@location(0)position: vec2f)->@builtin(position)vec4f {let rotatedPosition=vec2f(position.x*uniforms.rotation.x-position.y*uniforms.rotation.y,position.x*uniforms.rotation.y+position.y*uniforms.rotation.x);let clipSpace=GetClipSpace(rotatedPosition+uniforms.translation);return vec4f(clipSpace,0.0,1.0);}@fragment fn fragment()->@location(0)vec4f {return uniforms.color;}";/**
 * @module Rotation
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Rotation
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-rotation.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.11
 * @license MIT
 */(async function(r){let e;r.style.backgroundPosition="-1.5px -1.5px, -1.5px -1.5px, -1px -1px, -1px -1px",r.style.backgroundSize="100px 100px, 100px 100px, 10px 10px, 10px 10px",r.style.backgroundColor="#000",r.style.backgroundImage=`
        linear-gradient(       #666 1.5px, transparent 1.5px),
        linear-gradient(90deg, #666 1.5px, transparent 1.5px),
        linear-gradient(       #333 1px,   transparent 1px),
        linear-gradient(90deg, #333 1px,   transparent 1px)
    `;try{e=new(await b.RenderPipeline(r,"Rotation",{alphaMode:"premultiplied"}))}catch(a){alert(a)}const n=new GUI().onChange(c),t={translation:[150,100],rotation:y.DegreesToRadians(30)},d={min:-360,max:360,step:1,converters:GUI.converters.radToDeg};n.add(t.translation,"0",0,1e3).name("translation.x"),n.add(t.translation,"1",0,1e3).name("translation.y"),n.add(t,"rotation",d);const s=e.CreateShaderModule([C,h]),{uniforms:o,buffer:i}=e.CreateUniformBuffer("uniforms");o.color.set([Math.random(),Math.random(),Math.random(),1]);const{vertexData:f,indexData:p,vertices:x}=S(),u=e.CreateIndexBuffer(p),{buffer:l,layout:m}=e.CreateVertexBuffer("position",f.length/2);e.WriteBuffer(i,o.color),e.WriteBuffer(l,f),e.WriteBuffer(u,p),e.SetVertexBuffers(l),e.SetIndexBuffer(u),e.CreatePipeline({vertex:e.CreateVertexState(s,void 0,m),fragment:e.CreateFragmentState(s)}),e.SetBindGroups(e.CreateBindGroup(e.CreateBindGroupEntries([{buffer:e.ResolutionBuffer},{buffer:i}])));function c(){o.translation.set(t.translation),o.rotation.set([Math.cos(t.rotation),Math.sin(t.rotation)]),e.WriteBuffer(i,o.rotation.buffer),e.Render(x)}new ResizeObserver(a=>{for(const g of a){const{inlineSize:v,blockSize:B}=g.contentBoxSize[0];e.SetCanvasSize(v,B)}c()}).observe(document.body)})(document.getElementById("lesson"));
