import{D as b,v as M,a,C as _,A as I,F as c}from"./index-Be8JE0C8.js";import{Q as L}from"./Quad-D4MTv-Aj.js";const U=""+new URL("pomeranian-BxXy5_gQ.mp4",import.meta.url).href;var z=`struct Transform\r
{\r
    matrix: mat4x4f\r
};

struct VertexOutput\r
{\r
    @builtin(position) position: vec4f,\r
    @location(0) textureCoord: vec2f\r
};

@group(0) @binding(0) var Sampler: sampler;\r
@group(0) @binding(1) var Texture: texture_external;\r
@group(0) @binding(2) var<uniform> transform: Transform;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput\r
{\r
    var output: VertexOutput;\r
    var position = GetQuadCoord(index);

    
    position = (position + 1) * 0.5;

    output.position = transform.matrix * vec4f(position, 0.0, 1.0);\r
    output.textureCoord = position;

    return output;\r
}

@fragment fn fragment(@location(0) textureCoord: vec2f) -> @location(0) vec4f\r
{\r
    return textureSampleBaseClampToEdge(Texture, Sampler, textureCoord);\r
}`;/**
 * @module Using Video
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Using Video Efficiently
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-textures-external-video.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.6
 * @license MIT
 */(async function(p){let t;try{t=new(await b.RenderPipeline(p,"Using Video"))}catch(e){alert(e)}const R=0,m=[],d=1,f=2e3,y=[0,1,0],P=[0,0,0],x=Math.PI*60/180,B=[0,0,2],E=M.set(1.2,.5),l=a.perspective(x,t.AspectRatio,d,f),v=a.lookAt(B,P,y),g=a.multiply(l,v),i=document.createElement("video");i.muted=i.loop=!0,i.preload="auto",i.src=U,t.CreatePipeline({module:t.CreateShaderModule([L,z])});const C=t.CreateColorAttachment();C.clearValue=new _(5000268).rgba,t.CreatePassDescriptor(C);const S=new(await b.Texture());await F(i);for(let e=0;e<4;e++){const r=S.CreateSampler({magFilter:e&1?c.LINEAR:c.NEAREST,minFilter:e&2?c.LINEAR:c.NEAREST,addressModeUV:I.REPEAT}),n=16*Float32Array.BYTES_PER_ELEMENT,o=t.CreateBuffer({usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,size:n}),s=new Float32Array(n/Float32Array.BYTES_PER_ELEMENT),u=s.subarray(R,16);m.push({sampler:r,matrixBuffer:o,matrixValues:s,matrix:u})}function F(e){return new Promise((r,n)=>{if(e.addEventListener("error",n),"requestVideoFrameCallback"in e)e.requestVideoFrameCallback(r);else{const o=()=>e.currentTime?r():requestAnimationFrame(o);o()}e.play().catch(n)})}function A(){requestAnimationFrame(A);const e=S.ImportExternalTexture(i);m.forEach(({matrix:r,sampler:n,matrixBuffer:o,matrixValues:s},u)=>{const w=u%2-.5,T=+(u<2)*2-1,V=[w*E[0],T*E[1],-.5];a.translate(g,V,r),a.rotateX(r,Math.PI*.25*Math.sign(T),r),a.scale(r,[1,-1,1],r),a.translate(r,[-.5,-.5,0],r),t.WriteBuffer(o,s),t.SetBindGroups(t.CreateBindGroup(t.CreateBindGroupEntries([n,e,{buffer:o}]))),t.Render(6,!1)}),t.Submit()}const h=new ResizeObserver(e=>{for(const r of e){const{inlineSize:n,blockSize:o}=r.contentBoxSize[0];t.SetCanvasSize(n,o)}a.perspective(x,t.AspectRatio,d,f,l),a.multiply(l,v,g),requestAnimationFrame(A)});p.addEventListener("click",()=>i[i.paused?"play":"pause"]()),h.observe(document.body)})(document.getElementById("lesson"));
