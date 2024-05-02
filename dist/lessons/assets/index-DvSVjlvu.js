import{U as f}from"./index-DEecJYvT.js";var I="struct ConstStruct{color: vec4f,offset: vec2f};struct VarStruct{scale: vec2f};struct VertStruct{@location(0)position: vec2f};struct VertexOutput{@builtin(position)position: vec4f,@location(0)color: vec4f};@group(0)@binding(0)var<storage,read>constStructs: array<ConstStruct>;@group(0)@binding(1)var<storage,read>varStructs: array<VarStruct>;@vertex fn vertex(vertex: VertStruct,@builtin(instance_index)instance: u32)->VertexOutput{let constStruct=constStructs[instance];let varStruct=varStructs[instance];var output: VertexOutput;output.position=vec4f(vertex.position*varStruct.scale+constStruct.offset,0.0,1.0);output.color=constStruct.color;return output;}@fragment fn fragment(@location(0)color: vec4f)->@location(0)vec4f {return color;}";/**
 * @module Vertex Buffers
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Vertex Buffers
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-vertex-buffers.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.3
 * @license MIT
 */(async function(u){let t;try{t=new(await f.RenderPipeline(u,"Vertex Buffers"))}catch(r){alert(r)}const L=0,Y=4,w=0,i=100,d=[],C=t.CreateRenderPassDescriptor(t.CreateColorAttachment(void 0,"clear","store",[.3,.3,.3,1])),_=t.CreateShaderModule(I),T=t.CreateRenderPipeline({fragment:t.CreateFragmentState(_),vertex:t.CreateVertexState(_,"vertex",{arrayStride:2*Float32Array.BYTES_PER_ELEMENT,attributes:[t.CreateVertexBufferAttribute("float32x2")]})}),x=4*Float32Array.BYTES_PER_ELEMENT+2*Float32Array.BYTES_PER_ELEMENT+2*Float32Array.BYTES_PER_ELEMENT,y=x*i,P=2*Float32Array.BYTES_PER_ELEMENT,V=P*i,{vertexData:b,vertices:R}=D({innerRadius:.25,outerRadius:.5}),h=t.CreateBuffer({label:"Constant Storage Buffer",size:y,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),A=t.CreateBuffer({label:"Variable Storage Buffer",size:V,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),M=t.CreateBuffer({label:"Vertex Buffer",size:b.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});t.WriteBuffer(M,b);{const r=new Float32Array(y/Float32Array.BYTES_PER_ELEMENT);for(let e=0;e<i;++e){const o=x/4*e;r.set([c(),c(),c(),1],o+L),r.set([c(-.9,.9),c(-.9,.9)],o+Y),d.push({scale:c(.2,.5)})}t.WriteBuffer(h,r)}const U=new Float32Array(V/Float32Array.BYTES_PER_ELEMENT),m=t.CreateBindGroupEntries([{buffer:h},{buffer:A}]),N=t.CreateBindGroup({layout:T.getBindGroupLayout(0),entries:m});function D({endAngle:r=Math.PI*2,subdivisions:e=24,innerRadius:o=0,outerRadius:a=1,startAngle:S=0}){const z=e*3*2,E=new Float32Array(z*2);let G=0;const n=(s,l)=>{E[G++]=s,E[G++]=l},O=r-S;for(let s=0;s<e;s++){const l=S+(s+0)*O/e,F=S+(s+1)*O/e,B=Math.cos(l),v=Math.sin(l),g=Math.cos(F),p=Math.sin(F);n(B*o,v*o),n(g*o,p*o),n(g*a,p*a),n(g*a,p*a),n(B*a,v*a),n(B*o,v*o)}return{vertexData:E,vertices:z}}function c(r=0,e=1){return e===void 0&&(e=r,r=0),Math.random()*(e-r)+r}function W(){f.SetCanvasSize(u.width,u.height);const r=f.AspectRatio;C.colorAttachments[0].view=f.CurrentTextureView,d.forEach(({scale:e},o)=>{const a=P/4*o;U.set([e/r,e],a+w)}),t.AddBindGroups(N),t.SetVertexBuffers(M),t.WriteBuffer(A,U),t.Render(C,T,[R,i])}new ResizeObserver(r=>{for(const e of r){const{inlineSize:o,blockSize:a}=e.contentBoxSize[0];f.SetCanvasSize(o,a)}W()}).observe(u)})(document.getElementById("lesson"));