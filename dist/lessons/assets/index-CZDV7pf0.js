import{c as F,a as G}from"./mipmaps-kMQ0t0FP.js";import{U as g,C as N,A as v,F as c}from"./index-CDSOL_j-.js";import{M as L}from"./MipmapFilter-nkAaR1eK.js";import{v as _,m as o}from"./wgpu-matrix.module-CNlPNSC1.js";import{Q as z}from"./Quad-VFYOTGYq.js";/**
 * @module Mipmap Filter
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Textures
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-textures.html#mipmapfilter}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.5
 * @license MIT
 */(async function(u){let t;try{t=new(await g.RenderPipeline(u,"Mipmap Filter"))}catch(e){alert(e)}t.CreatePipeline({module:t.CreateShaderModule([z,L])});const m=t.CreateColorAttachment();m.clearValue=new N(5000268).rgba,t.CreatePassDescriptor(m);const p=new(await g.Texture());let d=0;const x=0,T=[],f=[B(F(),"Blended"),B(G(),"Checked")];for(let e=0;e<8;e++){const n=p.CreateSampler({addressModeU:v.REPEAT,addressModeV:v.REPEAT,magFilter:e&1?c.LINEAR:c.NEAREST,minFilter:e&2?c.LINEAR:c.NEAREST,mipmapFilter:e&4?c.LINEAR:c.NEAREST}),a=16*Float32Array.BYTES_PER_ELEMENT,r=t.CreateBuffer({usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,size:a}),s=new Float32Array(a/Float32Array.BYTES_PER_ELEMENT),i=s.subarray(x,16);t.AddBindGroups(f.map(l=>t.CreateBindGroup(t.CreateBindGroupEntries([n,l.createView(),{buffer:r}])))),T.push({matrixBuffer:r,matrixValues:s,matrix:i})}const A=1,R=2e3,b=[0,1,0],U=[0,0,0],h=60*Math.PI/180,y=[0,0,2],S=_.set(1.2,.7),E=o.perspective(h,t.AspectRatio,A,R),C=o.inverse(o.lookAt(y,U,b)),P=o.multiply(E,C);function B(e,n){const a=p.CreateTexture({usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST,size:[e[0].width,e[0].height],mipLevelCount:e.length,label:`${n} Texture`,format:"rgba8unorm"});return e.forEach(({data:r,width:s,height:i},l)=>p.WriteTexture(r,{bytesPerRow:s*4,texture:a,mipLevel:l,width:s,height:i})),a}function M(){T.forEach(({matrix:e,matrixBuffer:n,matrixValues:a},r)=>{const i=r%4-1.5,l=+(r<4)*2-1,I=r*f.length+d,w=[i*S[0],l*S[1],-50*.5];o.translate(P,w,e),o.rotateX(e,.5*Math.PI,e),o.scale(e,[1,50*2,1],e),o.translate(e,[-.5,-.5,0],e),t.WriteBuffer(n,a),t.SetActiveBindGroups(I),t.Render(6,!1)}),t.Submit()}new ResizeObserver(e=>{for(const n of e){const{inlineSize:a,blockSize:r}=n.contentBoxSize[0];t.SetCanvasSize(a,r)}o.perspective(h,t.AspectRatio,A,R,E),o.multiply(E,C,P),M()}).observe(u),u.addEventListener("click",()=>{d=(d+1)%f.length,M()})})(document.getElementById("lesson"));