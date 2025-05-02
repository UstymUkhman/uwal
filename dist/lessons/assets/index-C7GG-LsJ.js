import{D as N}from"./index-Be8JE0C8.js";var R=`struct ConstStruct
{
    color: vec4f,
    offset: vec2f
};

struct VarStruct
{
    scale: vec2f
};

struct VertStruct
{
    position: vec2f
};

struct VertexOutput
{
    @builtin(position) position: vec4f,
    @location(0) color: vec4f
};

@group(0) @binding(0) var<storage, read> constStructs: array<ConstStruct>;
@group(0) @binding(1) var<storage, read> varStructs: array<VarStruct>;
@group(0) @binding(2) var<storage, read> vertStructs: array<VertStruct>;

@vertex fn vertex(
    @builtin(vertex_index) vertex: u32,
    @builtin(instance_index) instance: u32
) -> VertexOutput
{
    let constStruct = constStructs[instance];
    let varStruct = varStructs[instance];

    var output: VertexOutput;

    output.position = vec4f(
        vertStructs[vertex].position * varStruct.scale + constStruct.offset,
        0.0, 1.0
    );

    output.color = constStruct.color;

    return output;
}

@fragment fn fragment(@location(0) color: vec4f) -> @location(0) vec4f
{
    return color;
}`;/**
 * @module Storage Buffers
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Storage Buffers
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-storage-buffers.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.4
 * @license MIT
 */(async function(i){let t;try{t=new(await N.RenderPipeline(i,"Storage Buffers"))}catch(e){alert(e)}const O=0,U=4,F=0,f=100,p=[],w=t.CreatePassDescriptor(t.CreateColorAttachment(void 0,"clear","store",[.3,.3,.3,1])),d=t.CreateShaderModule(R);t.CreatePipeline({vertex:t.CreateVertexState(d),fragment:t.CreateFragmentState(d)});const C=4*Float32Array.BYTES_PER_ELEMENT+2*Float32Array.BYTES_PER_ELEMENT+2*Float32Array.BYTES_PER_ELEMENT,_=C*f,b=2*Float32Array.BYTES_PER_ELEMENT,P=b*f,{vertexData:T,vertices:Y}=L({innerRadius:.25,outerRadius:.5}),y=t.CreateBuffer({label:"Constant Storage Buffer",size:_,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),h=t.CreateBuffer({label:"Variable Storage Buffer",size:P,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),V=t.CreateBuffer({label:"Vertices Storage Buffer",size:T.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});t.WriteBuffer(V,T);{const e=new Float32Array(_/Float32Array.BYTES_PER_ELEMENT);for(let r=0;r<f;++r){const n=C/4*r;e.set([a(),a(),a(),1],n+O),e.set([a(-.9,.9),a(-.9,.9)],n+U),p.push({scale:a(.2,.5)})}t.WriteBuffer(y,e)}const x=new Float32Array(P/Float32Array.BYTES_PER_ELEMENT),D=t.CreateBindGroup(t.CreateBindGroupEntries([{buffer:y},{buffer:h},{buffer:V}]));t.SetBindGroups(D);function L({endAngle:e=Math.PI*2,subdivisions:r=24,innerRadius:n=0,outerRadius:o=1,startAngle:S=0}){const z=r*3*2,l=new Float32Array(z*2);let A=0;const c=(s,u)=>{l[A++]=s,l[A++]=u},G=e-S;for(let s=0;s<r;s++){const u=S+(s+0)*G/r,M=S+(s+1)*G/r,g=Math.cos(u),v=Math.sin(u),E=Math.cos(M),B=Math.sin(M);c(g*n,v*n),c(E*n,B*n),c(E*o,B*o),c(E*o,B*o),c(g*o,v*o),c(g*n,v*n)}return{vertexData:l,vertices:z}}function a(e,r){return e===void 0?(e=0,r=1):r===void 0&&(r=e,e=0),Math.random()*(r-e)+e}function m(){t.SetCanvasSize(i.width,i.height);const e=t.AspectRatio;w.colorAttachments[0].view=t.CurrentTextureView,p.forEach(({scale:r},n)=>{const o=b/4*n;x.set([r/e,r],o+F)}),t.WriteBuffer(h,x),t.Render([Y,f])}new ResizeObserver(e=>{for(const r of e){const{inlineSize:n,blockSize:o}=r.contentBoxSize[0];t.SetCanvasSize(n,o)}m()}).observe(document.body)})(document.getElementById("lesson"));
