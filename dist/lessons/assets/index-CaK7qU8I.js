import{D as b}from"./index-BEuvW3M9.js";import{c as v}from"./F-CZA4EI5f.js";import{R as S}from"./Resolution-Cnr3CPX7.js";var C="struct Uniforms{color: vec4f,translation: vec2f};@group(0)@binding(1)var<uniform>uniforms: Uniforms;@vertex fn vertex(@location(0)position: vec2f)->@builtin(position)vec4f {let clipSpace=GetClipSpace(position+uniforms.translation);return vec4f(clipSpace,0.0,1.0);}@fragment fn fragment()->@location(0)vec4f {return uniforms.color;}";/**
 * @module Translation
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Translation
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-translation.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.11
 * @license MIT
 */(async function(r){let e;r.style.backgroundPosition="-1.5px -1.5px, -1.5px -1.5px, -1px -1px, -1px -1px",r.style.backgroundSize="100px 100px, 100px 100px, 10px 10px, 10px 10px",r.style.backgroundColor="#000",r.style.backgroundImage=`
        linear-gradient(       #666 1.5px, transparent 1.5px),
        linear-gradient(90deg, #666 1.5px, transparent 1.5px),
        linear-gradient(       #333 1px,   transparent 1px),
        linear-gradient(90deg, #333 1px,   transparent 1px)
    `;try{e=new(await b.RenderPipeline(r,"Translation",{alphaMode:"premultiplied"}))}catch(a){alert(a)}const i=new GUI().onChange(c),n={translation:[0,0]};i.add(n.translation,"0",0,1e3).name("translation.x"),i.add(n.translation,"1",0,1e3).name("translation.y");const f=e.CreateShaderModule([S,C]),{uniforms:t,buffer:o}=e.CreateUniformBuffer("uniforms");t.color.set([Math.random(),Math.random(),Math.random(),1]);const{vertexData:s,indexData:l,vertices:d}=v(),p=e.CreateIndexBuffer(l),{buffer:u,layout:x}=e.CreateVertexBuffer("position",s.length/2);e.WriteBuffer(o,t.color),e.WriteBuffer(u,s),e.WriteBuffer(p,l),e.SetVertexBuffers(u),e.SetIndexBuffer(p),e.CreatePipeline({vertex:e.CreateVertexState(f,void 0,x),fragment:e.CreateFragmentState(f)}),e.SetBindGroups(e.CreateBindGroup(e.CreateBindGroupEntries([{buffer:e.ResolutionBuffer},{buffer:o}])));function c(){t.translation.set(n.translation),e.WriteBuffer(o,t.translation,t.translation.byteOffset),e.Render(d)}new ResizeObserver(a=>{for(const m of a){const{inlineSize:g,blockSize:B}=m.contentBoxSize[0];e.SetCanvasSize(g,B)}c()}).observe(document.body)})(document.getElementById("lesson"));
