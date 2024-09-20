var D=t=>{throw TypeError(t)};var A=(t,e,o)=>e.has(t)||D("Cannot "+o);var r=(t,e,o)=>(A(t,e,"read from private field"),o?o.call(t):e.get(t)),f=(t,e,o)=>e.has(t)?D("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(t):e.set(t,o),m=(t,e,o,B)=>(A(t,e,"write to private field"),B?B.call(t,o):e.set(t,o),o),E=(t,e,o)=>(A(t,e,"access private method"),o);import{U as G,a as R}from"./index-CDSOL_j-.js";import{m as h}from"./wgpu-matrix.module-CNlPNSC1.js";var n,x,v,C,g,T,S,l,I,P,z;class X{constructor(e,o){f(this,l);f(this,n);f(this,x);f(this,v);f(this,C);f(this,g);f(this,T);f(this,S,new Float32Array(16));m(this,x,o??"Cube"),m(this,n,e),E(this,l,I).call(this),E(this,l,P).call(this),E(this,l,z).call(this)}SetGeometryBuffers(){r(this,n).SetVertexBuffers(r(this,g)),r(this,n).SetIndexBuffer(r(this,C),"uint16")}UpdateTransformBuffer(){r(this,n).WriteBuffer(r(this,T),this.Transform)}get TransformBuffer(){return r(this,T)}get Transform(){return r(this,S)}get Vertices(){return r(this,v)}}n=new WeakMap,x=new WeakMap,v=new WeakMap,C=new WeakMap,g=new WeakMap,T=new WeakMap,S=new WeakMap,l=new WeakSet,I=function(){const e=new Uint16Array([0,1,2,2,1,3,4,5,6,6,5,7,8,9,10,10,9,11,12,13,14,14,13,15,16,17,18,18,17,19,20,21,22,22,21,23]);m(this,C,r(this,n).CreateIndexBuffer(e,{label:`${r(this,x)} Index Buffer`})),r(this,n).WriteBuffer(r(this,C),e),m(this,v,e.length)},P=function(){const e=new Float32Array([-1,1,1,1,1,1,-1,1,-1,1,1,-1,1,-1,1,-1,-1,1,1,-1,-1,-1,-1,-1,-1,1,1,-1,-1,1,1,1,1,1,-1,1,1,1,-1,1,-1,-1,-1,1,-1,-1,-1,-1,-1,1,1,-1,1,-1,-1,-1,1,-1,-1,-1,1,1,-1,1,1,1,1,-1,-1,1,-1,1]);m(this,g,r(this,n).CreateVertexBuffer(e,{label:`${r(this,x)} Vertex Buffer`})),r(this,n).WriteBuffer(r(this,g),e)},z=function(){m(this,T,r(this,n).CreateBuffer({size:r(this,S).length*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,label:`${r(this,x)} Uniform Buffer`}))};var k="struct Transform{matrix: mat4x4f};struct VertexOutput{@builtin(position)position: vec4f,@location(0)normal: vec3f};@group(0)@binding(0)var Sampler: sampler;@group(0)@binding(1)var<uniform>transform: Transform;@group(0)@binding(2)var CubeTexture: texture_cube<f32>;@vertex fn vertex(@location(0)position: vec4f)->VertexOutput {var output: VertexOutput;output.position=transform.matrix*position;output.normal=normalize(position.xyz);return output;}@fragment fn fragment(@location(0)normal: vec3f)->@location(0)vec4f {return textureSample(CubeTexture,Sampler,normalize(normal));}";/**
 * @module Cubemaps
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Cubemaps
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-cube-maps.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.6
 * @license MIT
 */(async function(t){let e,o;try{e=new(await G.RenderPipeline(t,"Cubemaps",{alphaMode:"premultiplied"}))}catch(a){alert(a)}const B=e.CreateColorAttachment();B.clearValue=[0,0,0,1],e.CreatePassDescriptor(B,void 0,e.CreateDepthAttachment());const V=e.CreateShaderModule(k),_=R.DegreesToRadians(60);e.CreatePipeline({primitive:{cullMode:"back"},fragment:e.CreateFragmentState(V),vertex:e.CreateVertexState(V,void 0,{arrayStride:Float32Array.BYTES_PER_ELEMENT*3,attributes:[e.CreateVertexBufferAttribute("float32x3")]}),depthStencil:{depthWriteEnabled:!0,format:"depth24plus",depthCompare:"less"}});const F=new(await G.Texture()),b=new X(e),s=b.Transform;F.SetRenderer(e),b.SetGeometryBuffers();const M=[{faceColor:"#F00",textColor:"#0FF",text:"+X"},{faceColor:"#FF0",textColor:"#00F",text:"-X"},{faceColor:"#0F0",textColor:"#F0F",text:"+Y"},{faceColor:"#0FF",textColor:"#F00",text:"-Y"},{faceColor:"#00F",textColor:"#FF0",text:"+Z"},{faceColor:"#F0F",textColor:"#0F0",text:"-Z"}].map(a=>W(a)),O=F.CreateSampler({filter:"linear"}),N=L(M);e.SetBindGroups(e.CreateBindGroup(e.CreateBindGroupEntries([O,{buffer:b.TransformBuffer},N.createView({dimension:"cube"})])));const Y=h.lookAt([0,1,5],[0,0,0],[0,1,0]),d={rotation:[R.DegreesToRadians(20),R.DegreesToRadians(25),R.DegreesToRadians(0)]},y={converters:GUI.converters.radToDeg,min:-360,max:360,step:1},U=new GUI;U.onChange(w),U.add(d.rotation,"0",y).name("rotation.x"),U.add(d.rotation,"1",y).name("rotation.y"),U.add(d.rotation,"2",y).name("rotation.z");function W({faceColor:a,textColor:c,text:p}){const u=document.createElement("canvas"),i=u.getContext("2d");return u.width=u.height=128,i.fillStyle=a,i.fillRect(0,0,128,128),i.textAlign="center",i.fillStyle=c,i.textBaseline="middle",i.font="90px sans-serif",i.fillText(p,64,64),u}function L(a){const c=a[0],p=F.CreateTextureFromSource(c,{size:[c.width,c.height,a.length],usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST,format:"rgba8unorm"});return a.forEach((u,i)=>F.CopyImageToTexture(u,{generateMipmaps:i===a.length-1,destinationOrigin:[0,0,i],texture:p})),p}function w(){h.perspective(_,o,.1,10,s),h.multiply(s,Y,s),h.rotateX(s,d.rotation[0],s),h.rotateY(s,d.rotation[1],s),h.rotateZ(s,d.rotation[2],s),b.UpdateTransformBuffer(),e.Render(b.Vertices)}new ResizeObserver(a=>{for(const c of a){const{inlineSize:p,blockSize:u}=c.contentBoxSize[0];e.SetCanvasSize(p,u)}o=e.AspectRatio,w()}).observe(t)})(document.getElementById("lesson"));