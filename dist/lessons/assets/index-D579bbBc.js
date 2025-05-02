import{c as S}from"./F-CZA4EI5f.js";import{D as y,U as C,m as f}from"./index-Be8JE0C8.js";var h=`struct Uniforms
{
    color: vec4f,
    matrix: mat3x3f
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex fn vertex(@location(0) position: vec2f) -> @builtin(position) vec4f
{
    
    let clipSpace = (uniforms.matrix * vec3f(position, 1)).xy;
    return vec4f(clipSpace, 0.0, 1.0);
}

@fragment fn fragment() -> @location(0) vec4f
{
    return uniforms.color;
}`;/**
 * @module Adding in Projection
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Matrix Math
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-matrix-math.html#adding-in-projection}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.11
 * @license MIT
 */(async function(n){let e;n.style.backgroundPosition="-1.5px -1.5px, -1.5px -1.5px, -1px -1px, -1px -1px",n.style.backgroundSize="100px 100px, 100px 100px, 10px 10px, 10px 10px",n.style.backgroundColor="#000",n.style.backgroundImage=`
        linear-gradient(       #666 1.5px, transparent 1.5px),
        linear-gradient(90deg, #666 1.5px, transparent 1.5px),
        linear-gradient(       #333 1px,   transparent 1px),
        linear-gradient(90deg, #333 1px,   transparent 1px)
    `;try{e=new(await y.RenderPipeline(n,"MatrixMath",{alphaMode:"premultiplied"}))}catch(o){alert(o)}const a=new GUI().onChange(u),m={min:-360,max:360,step:1,converters:GUI.converters.radToDeg},r={translation:[150,100],rotation:C.DegreesToRadians(30),scale:[1,1]};a.add(r.translation,"0",0,1e3).name("translation.x"),a.add(r.translation,"1",0,1e3).name("translation.y"),a.add(r,"rotation",m),a.add(r.scale,"0",-5,5).name("scale.x"),a.add(r.scale,"1",-5,5).name("scale.y");const{vertexData:c,indexData:l,vertices:g}=S(),p=e.CreateIndexBuffer(l),d=e.CreateShaderModule(h),{layout:v,buffer:x}=e.CreateVertexBuffer("position",c.length/2);e.CreatePipeline({vertex:e.CreateVertexState(d,void 0,v),fragment:e.CreateFragmentState(d)});const{uniforms:i,buffer:s}=e.CreateUniformBuffer("uniforms");i.color.set([Math.random(),Math.random(),Math.random(),1]),e.WriteBuffer(s,i.color),e.SetBindGroups(e.CreateBindGroup(e.CreateBindGroupEntries({buffer:s}))),e.WriteBuffer(x,c),e.WriteBuffer(p,l),e.SetVertexBuffers(x),e.SetIndexBuffer(p);function u(){const o=e.Projection2D;let t=f.translate(o,r.translation);t=f.rotate(t,r.rotation),t=f.scale(t,r.scale),i.matrix.set(t),e.WriteBuffer(s,i.matrix.buffer),e.Render(g)}new ResizeObserver(o=>{for(const t of o){const{inlineSize:B,blockSize:b}=t.contentBoxSize[0];e.SetCanvasSize(B,b)}u()}).observe(document.body)})(document.getElementById("lesson"));
