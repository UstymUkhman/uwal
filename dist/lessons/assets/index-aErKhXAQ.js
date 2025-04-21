var w=n=>{throw TypeError(n)};var A=(n,e,r)=>e.has(n)||w("Cannot "+r);var t=(n,e,r)=>(A(n,e,"read from private field"),r?r.call(n):e.get(n)),f=(n,e,r)=>e.has(n)?w("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(n):e.set(n,r),h=(n,e,r,b)=>(A(n,e,"write to private field"),b?b.call(n,r):e.set(n,r),r),y=(n,e,r)=>(A(n,e,"access private method"),r);import{U as P,a as E}from"./index-DEQUc6k7.js";import{m as B}from"./wgpu-matrix.module-CrC5GWIH.js";var x,S,o,u,l,m,C,d,I,z,G;class X{constructor(e,r){f(this,d);f(this,x);f(this,S);f(this,o);f(this,u);f(this,l);f(this,m,[]);f(this,C,new Float32Array(16));h(this,x,r??"Cube"),h(this,o,e),y(this,d,I).call(this),y(this,d,z).call(this),y(this,d,G).call(this)}AddVertexBuffers(e){t(this,m).push(...Array.isArray(e)&&e||[e])}UpdateTransformBuffer(){t(this,o).WriteBuffer(t(this,l),t(this,C))}Render(e=!0){t(this,o).SavePipelineState(),t(this,o).Render(this.Update(),e),t(this,o).RestorePipelineState()}Update(){return t(this,o).WriteBuffer(t(this,l),t(this,C)),t(this,o).SetIndexBuffer(t(this,u),"uint16"),t(this,o).SetVertexBuffers(t(this,m)),t(this,S)}get TransformBuffer(){return t(this,l)}get Transform(){return t(this,C)}get Vertices(){return t(this,S)}Destroy(){h(this,l,t(this,l).destroy()),t(this,m).forEach(e=>e.destroy()),h(this,u,t(this,u).destroy()),t(this,m).splice(0)}}x=new WeakMap,S=new WeakMap,o=new WeakMap,u=new WeakMap,l=new WeakMap,m=new WeakMap,C=new WeakMap,d=new WeakSet,I=function(){const e=new Uint16Array([0,1,2,2,1,3,4,5,6,6,5,7,8,9,10,10,9,11,12,13,14,14,13,15,16,17,18,18,17,19,20,21,22,22,21,23]);h(this,u,t(this,o).CreateIndexBuffer(e,{label:`${t(this,x)} Index Buffer`})),t(this,o).WriteBuffer(t(this,u),e),t(this,o).SetIndexBuffer(t(this,u),"uint16"),h(this,S,e.length)},z=function(){const e=new Float32Array([-1,1,1,1,1,1,-1,1,-1,1,1,-1,1,-1,1,-1,-1,1,1,-1,-1,-1,-1,-1,-1,1,1,-1,-1,1,1,1,1,1,-1,1,1,1,-1,1,-1,-1,-1,1,-1,-1,-1,-1,-1,1,1,-1,1,-1,-1,-1,1,-1,-1,-1,1,1,-1,1,1,1,1,-1,-1,1,-1,1]),r=t(this,o).CreateVertexBuffer(e,{label:`${t(this,x)} Vertex Buffer`});t(this,o).WriteBuffer(r,e),t(this,o).SetVertexBuffers(r),t(this,m).push(r)},G=function(){h(this,l,t(this,o).CreateBuffer({size:t(this,C).length*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,label:`${t(this,x)} Uniform Buffer`}))};var k=`struct transform\r
{\r
    matrix: mat4x4f\r
};

struct VertexOutput\r
{\r
    @builtin(position) position: vec4f,\r
    @location(0) normal: vec3f\r
};

@group(0) @binding(0) var Sampler: sampler;\r
@group(0) @binding(1) var<uniform> Transform: transform;\r
@group(0) @binding(2) var CubeTexture: texture_cube<f32>;

@vertex fn vertex(@location(0) position: vec4f) -> VertexOutput\r
{\r
    var output: VertexOutput;

    output.position = Transform.matrix * position;\r
    output.normal = normalize(position.xyz);

    return output;\r
}

@fragment fn fragment(@location(0) normal: vec3f) -> @location(0) vec4f\r
{\r
    return textureSample(CubeTexture, Sampler, normalize(normal));\r
}`;/**
 * @module Cubemaps
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Cubemaps
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-cube-maps.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.6
 * @license MIT
 */(async function(n){let e,r;try{e=new(await P.RenderPipeline(n,"Cubemaps",{alphaMode:"premultiplied"}))}catch(a){alert(a)}const b=e.CreateColorAttachment();b.clearValue=[0,0,0,1],e.CreatePassDescriptor(b,void 0,e.CreateDepthAttachment());const V=e.CreateShaderModule(k),_=E.DegreesToRadians(60);e.CreatePipeline({primitive:{cullMode:"back"},fragment:e.CreateFragmentState(V),vertex:e.CreateVertexState(V,void 0,{arrayStride:Float32Array.BYTES_PER_ELEMENT*3,attributes:[e.CreateVertexBufferAttribute("float32x3")]}),depthStencil:{depthWriteEnabled:!0,format:"depth24plus",depthCompare:"less"}});const v=new(await P.Texture()),F=new X(e),s=F.Transform;v.SetRenderer(e);const O=[{faceColor:"#F00",textColor:"#0FF",text:"+X"},{faceColor:"#FF0",textColor:"#00F",text:"-X"},{faceColor:"#0F0",textColor:"#F0F",text:"+Y"},{faceColor:"#0FF",textColor:"#F00",text:"-Y"},{faceColor:"#00F",textColor:"#FF0",text:"+Z"},{faceColor:"#F0F",textColor:"#0F0",text:"-Z"}].map(a=>W(a)),M=v.CreateSampler({filter:"linear"}),N=L(O);e.SetBindGroups(e.CreateBindGroup(e.CreateBindGroupEntries([M,{buffer:F.TransformBuffer},N.createView({dimension:"cube"})])));const Y=B.lookAt([0,1,5],[0,0,0],[0,1,0]),g={rotation:[E.DegreesToRadians(20),E.DegreesToRadians(25),E.DegreesToRadians(0)]},R={converters:GUI.converters.radToDeg,min:-360,max:360,step:1},U=new GUI;U.onChange(D),U.add(g.rotation,"0",R).name("rotation.x"),U.add(g.rotation,"1",R).name("rotation.y"),U.add(g.rotation,"2",R).name("rotation.z");function W({faceColor:a,textColor:p,text:T}){const c=document.createElement("canvas"),i=c.getContext("2d");return c.width=c.height=128,i.fillStyle=a,i.fillRect(0,0,128,128),i.textAlign="center",i.fillStyle=p,i.textBaseline="middle",i.font="90px sans-serif",i.fillText(T,64,64),c}function L(a){const p=a[0],T=v.CreateTextureFromSource(p,{size:[p.width,p.height,a.length],usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST,format:"rgba8unorm"});return a.forEach((c,i)=>v.CopyImageToTexture(c,{mipmaps:i===a.length-1,destinationOrigin:[0,0,i],texture:T})),T}function D(){B.perspective(_,r,.1,10,s),B.multiply(s,Y,s),B.rotateX(s,g.rotation[0],s),B.rotateY(s,g.rotation[1],s),B.rotateZ(s,g.rotation[2],s),F.UpdateTransformBuffer(),e.Render(F.Vertices)}new ResizeObserver(a=>{for(const p of a){const{inlineSize:T,blockSize:c}=p.contentBoxSize[0];e.SetCanvasSize(T,c)}r=e.AspectRatio,D()}).observe(document.body)})(document.getElementById("lesson"));
