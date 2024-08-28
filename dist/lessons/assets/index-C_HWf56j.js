import{M as z}from"./MipmapFilter-nkAaR1eK.js";import{U as x,C as L,A as B,F as l}from"./index-BefPI_NB.js";import{v as D,m as s}from"./wgpu-matrix.module-CNlPNSC1.js";import{Q as O}from"./Quad-VFYOTGYq.js";/**
 * @module Loading Canvas
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Loading Images into Textures
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-importing-textures.html#loading-canvas}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.5
 * @license MIT
 */(async function(m){let r;try{r=new(await x.RenderPipeline(m,"Loading Canvas"))}catch(e){alert(e)}const n=256,u=n/2,U=0,p=[],E=1,T=2e3,y=[0,1,0],M=[0,0,0],A=Math.PI*60/180,F=[0,0,2],R=D.set(1.2,.7),d=s.perspective(A,r.AspectRatio,E,T),v=s.inverse(s.lookAt(F,M,y)),S=s.multiply(d,v),a=document.createElement("canvas").getContext("2d");a.canvas.width=a.canvas.height=n;const f=new(await x.Texture());f.SetRenderer(r);const C=N(a.canvas,!0);r.CreatePipeline({module:r.CreateShaderModule([O,z])});const g=r.CreateColorAttachment();g.clearValue=new L(5000268).rgba,r.CreatePassDescriptor(g);for(let e=0;e<8;e++){const t=f.CreateSampler({addressModeU:B.REPEAT,addressModeV:B.REPEAT,magFilter:e&1?l.LINEAR:l.NEAREST,minFilter:e&2?l.LINEAR:l.NEAREST,mipmapFilter:e&4?l.LINEAR:l.NEAREST}),o=16*Float32Array.BYTES_PER_ELEMENT,c=r.CreateBuffer({usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,size:o}),i=new Float32Array(o/Float32Array.BYTES_PER_ELEMENT),h=i.subarray(U,16);r.AddBindGroups(r.CreateBindGroup(r.CreateBindGroupEntries([t,C.createView(),{buffer:c}]))),p.push({matrixBuffer:c,matrixValues:i,matrix:h})}const I=(e,t,o)=>`hsl(${e*360|0}, ${t*100}%, ${o*100|0}%)`;function N(e,t=!1){return f.CopyImageToTexture(e,{create:{usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST,format:"rgba8unorm",mipmaps:t}})}function b(e){a.clearRect(0,0,n,n),a.save(),a.translate(u,u);const t=20;for(let o=0;o<t;o++)a.fillStyle=I(o/t*.2+e*.1,1,o%2*.5),a.fillRect(-u,-u,n,n),a.rotate(e*.5),a.scale(.85,.85),a.translate(n/16,0);a.restore()}function P(e){b(e*1e-4),requestAnimationFrame(P),f.CopyImageToTexture(a.canvas,{texture:C}),p.forEach(({matrix:t,matrixBuffer:o,matrixValues:c},i)=>{const w=i%4-1.5,G=+(i<4)*2-1,_=[w*R[0],G*R[1],-50*.5];s.translate(S,_,t),s.rotateX(t,Math.PI*.5,t),s.scale(t,[1,50*2,1],t),s.translate(t,[-.5,-.5,0],t),r.WriteBuffer(o,c),r.SetActiveBindGroups(i),r.Render(6,!1)}),r.Submit()}new ResizeObserver(e=>{for(const t of e){const{inlineSize:o,blockSize:c}=t.contentBoxSize[0];r.SetCanvasSize(o,c)}s.perspective(A,r.AspectRatio,E,T,d),s.multiply(d,v,S),requestAnimationFrame(P)}).observe(m)})(document.getElementById("lesson"));
