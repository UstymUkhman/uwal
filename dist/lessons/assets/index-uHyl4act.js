import{c as y}from"./F-CZA4EI5f.js";import{D as S,U as C,m as o}from"./index-D5aOD4ei.js";var D="struct Uniforms{color: vec4f,matrix: mat3x3f};@group(0)@binding(0)var<uniform>uniforms: Uniforms;@vertex fn vertex(@location(0)position: vec2f)->@builtin(position)vec4f {let clipSpace=(uniforms.matrix*vec3f(position,1)).xy;return vec4f(clipSpace,0.0,1.0);}@fragment fn fragment()->@location(0)vec4f {return uniforms.color;}";/**
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
    `;try{e=new(await S.RenderPipeline(n,"Adding in Projection",{alphaMode:"premultiplied"}))}catch(s){alert(s)}const a=new GUI().onChange(l),m={min:-360,max:360,step:1,converters:GUI.converters.radToDeg},t={translation:[150,100],rotation:C.DegreesToRadians(30),scale:[1,1]};a.add(t.translation,"0",0,1e3).name("translation.x"),a.add(t.translation,"1",0,1e3).name("translation.y"),a.add(t,"rotation",m),a.add(t.scale,"0",-5,5).name("scale.x"),a.add(t.scale,"1",-5,5).name("scale.y");const{vertexData:f,indexData:c,vertices:u}=y(),d=e.CreateIndexBuffer(c),x=e.CreateShaderModule(D),{layout:g,buffer:p}=e.CreateVertexBuffer("position",f.length/2);e.CreatePipeline({vertex:e.CreateVertexState(x,void 0,g),fragment:e.CreateFragmentState(x)});const{uniforms:r,buffer:i}=e.CreateUniformBuffer("uniforms");r.color.set([Math.random(),Math.random(),Math.random(),1]),e.WriteBuffer(i,r.color),e.SetBindGroups(e.CreateBindGroup(e.CreateBindGroupEntries({buffer:i}))),e.WriteBuffer(p,f),e.WriteBuffer(d,c),e.SetVertexBuffers(p),e.SetIndexBuffer(d);function l(){o.copy(e.Projection2D,r.matrix),o.translate(r.matrix,t.translation,r.matrix),o.rotate(r.matrix,t.rotation,r.matrix),o.scale(r.matrix,t.scale,r.matrix),e.WriteBuffer(i,r.matrix.buffer),e.Render(u)}new ResizeObserver(s=>{for(const v of s){const{inlineSize:B,blockSize:b}=v.contentBoxSize[0];e.SetCanvasSize(B,b),e.UpdateProjection2D()}l()}).observe(document.body)})(document.getElementById("lesson"));
