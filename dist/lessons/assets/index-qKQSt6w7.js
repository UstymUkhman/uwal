import{U as W}from"./index-CwSwZyiJ.js";var X="struct VertexOutput{@builtin(position)position: vec4f,@location(0)color: vec4f};@vertex fn vertex(@location(0)position: vec2f,@location(1)color: vec4f,@location(2)offset: vec2f,@location(3)scale: vec2f,@location(4)vertexColor: vec4f)->VertexOutput{var output: VertexOutput;output.position=vec4f(position*scale+offset,0.0,1.0);output.color=color*vertexColor;return output;}@fragment fn fragment(@location(0)color: vec4f)->@location(0)vec4f {return color;}";/**
 * @module Vertex Buffers
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Vertex Buffers
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-vertex-buffers.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.4
 * @license MIT
 */(async function(i){let e;try{e=new(await W.RenderPipeline(i,"Vertex Buffers"))}catch(r){alert(r)}const M=0,O=1,w=0,l=100,C=[],F=e.CreatePassDescriptor(e.CreateColorAttachment(void 0,"clear","store",[.3,.3,.3,1])),v=e.CreateShaderModule(X);e.CreatePipeline({fragment:e.CreateFragmentState(v),vertex:e.CreateVertexState(v,"vertex",[{arrayStride:4+2*Float32Array.BYTES_PER_ELEMENT,attributes:[e.CreateVertexBufferAttribute("float32x2"),e.CreateVertexBufferAttribute("unorm8x4",4,8)]},{arrayStride:4+2*Float32Array.BYTES_PER_ELEMENT,stepMode:"instance",attributes:[e.CreateVertexBufferAttribute("unorm8x4",1),e.CreateVertexBufferAttribute("float32x2",2,4)]},{stepMode:"instance",arrayStride:2*Float32Array.BYTES_PER_ELEMENT,attributes:[e.CreateVertexBufferAttribute("float32x2",3)]}])});const U=4+2*Float32Array.BYTES_PER_ELEMENT,p=2*Float32Array.BYTES_PER_ELEMENT,P=U*l,b=p*l,{vertexData:g,indexData:S}=Y({innerRadius:.25,outerRadius:.5}),y=e.CreateBuffer({label:"Vertex Buffer",size:g.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});e.WriteBuffer(y,g);const A=e.CreateBuffer({label:"Constant Vertex Buffer",size:P,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),T=e.CreateBuffer({label:"Variable Vertex Buffer",size:b,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});e.SetVertexBuffers([y,A,T]);const h=e.CreateBuffer({label:"Index Buffer",size:S.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST});e.WriteBuffer(h,S),e.SetIndexBuffer(h);{const r=new Uint8Array(P),t=new Float32Array(r.buffer);for(let n=0;n<l;++n){const a=U*n,x=a/4;r.set([u(255),u(255),u(255),255],a+M),t.set([u(-.9,.9),u(-.9,.9)],x+O),C.push({scale:u(.2,.5)})}e.WriteBuffer(A,t)}const _=new Float32Array(b/Float32Array.BYTES_PER_ELEMENT),D=S.length;function Y({endAngle:r=Math.PI*2,subdivisions:t=24,innerRadius:n=0,outerRadius:a=1,startAngle:x=0}){const G=(t+1)*2,B=new Float32Array(G*3),V=new Uint8Array(B.buffer);let d=0,E=8;const z=(f,s,o)=>{B[d++]=f,B[d++]=s,V[E++]=o[0]*255,V[E++]=o[1]*255,V[E++]=o[2]*255,E+=9,d+=1},m=[1,1,1],N=[.1,.1,.1],I=r-x;for(let f=0;f<=t;f++){const s=x+f*I/t,o=Math.cos(s),R=Math.sin(s);z(o*a,R*a,N),z(o*n,R*n,m)}const c=new Uint32Array(t*6);for(let f=0,s=0;s<t;s++){const o=s*2;c[f++]=o+1,c[f++]=o+3,c[f++]=o+2,c[f++]=o+2,c[f++]=o+0,c[f++]=o+1}return{vertexData:B,indexData:c}}function u(r,t){return r===void 0?(r=0,t=1):t===void 0&&(t=r,r=0),Math.random()*(t-r)+r}function L(){e.SetCanvasSize(i.width,i.height);const r=e.AspectRatio;F.colorAttachments[0].view=e.CurrentTextureView,C.forEach(({scale:t},n)=>{const a=p/4*n;_.set([t/r,t],a+w)}),e.WriteBuffer(T,_),e.Render([D,l])}new ResizeObserver(r=>{for(const t of r){const{inlineSize:n,blockSize:a}=t.contentBoxSize[0];e.SetCanvasSize(n,a)}L()}).observe(i)})(document.getElementById("lesson"));
