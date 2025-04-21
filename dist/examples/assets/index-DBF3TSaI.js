import{U as d,C as G,F as h}from"./index-B6aSTZ5l.js";import{S as N,a as V}from"./Shape-D5AnAHJy.js";const Y=""+new URL("logo-DEvozEyj.jpg",import.meta.url).href;var D=`struct VertexOutput
{
    @location(0) textureCoord: vec2f,
    @builtin(position) position: vec4f,
    @location(1) @interpolate(flat) instance: u32
};

@group(1) @binding(0) var Sampler: sampler;
@group(1) @binding(1) var Texture: texture_2d<f32>;
@group(1) @binding(2) var<storage, read> visible: array<u32>;

@vertex fn vertex(
    @location(0) position: vec2f,
    @location(1) translation: vec2f,
    @builtin(instance_index) instance: u32
) -> VertexOutput
{
    var output: VertexOutput;
    let aspect = resolution.xy / resolution.y;
    let clipSpace = GetVertexClipSpace(position).xy;

    output.position = vec4f(clipSpace + translation, 0, 1);
    output.textureCoord = clipSpace * aspect * 2.5 + 0.5;
    output.instance = instance;

    return output;
}

@fragment fn fragment(
    @location(0) textureCoord: vec2f,
    @location(1) @interpolate(flat) instance: u32
) -> @location(0) vec4f
{
    if (visible[instance] == 0) { discard; }
    return textureSample(Texture, Sampler, textureCoord);
}`;/**
 * @example Textures / Instancing
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed by using a version listed below.
 * Please note that this code may be simplified in future
 * thanks to more recent library APIs.
 * @version 0.0.5
 * @license MIT
 */let l,x,m,s,p,t;async function z(i){try{t=new(await d.RenderPipeline(i,"Textures / Instancing"))}catch(e){alert(e)}const E=128,u=100;let a,S,B,c,o=500,T=performance.now()-o;const C=t.CreateShaderModule([N,D]),y=t.CreateColorAttachment();y.clearValue=new G(1651532).rgba,t.CreatePassDescriptor(y),t.CreatePipeline({fragment:t.CreateFragmentState(C),vertex:t.CreateVertexState(C,void 0,[{arrayStride:Float32Array.BYTES_PER_ELEMENT*2,attributes:[t.CreateVertexBufferAttribute("float32x2")]},{stepMode:"instance",arrayStride:Float32Array.BYTES_PER_ELEMENT*2,attributes:[t.CreateVertexBufferAttribute("float32x2",1)]}])});function U(){cancelAnimationFrame(l),clearTimeout(B),T=performance.now()-o}async function P(){R(),b(),w(),await F(),requestAnimationFrame(A),B=setTimeout(()=>o=~(c=-1),o*3)}function R(){const e=new V({renderer:t,segments:4,radius:E});e.Position=[i.width/2,i.height/2],e.Rotation=Math.PI/4,S=e.Update().Vertices}function b(){const e=GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST,r=Uint32Array.BYTES_PER_ELEMENT*u;a=new Uint32Array(r/Uint32Array.BYTES_PER_ELEMENT),s=t.CreateBuffer({size:r,usage:e}),t.WriteBuffer(s,a)}function w(){const e=1-Math.sqrt(2)*E/i.height,r=1-Math.sqrt(2)*E/i.width,n=Float32Array.BYTES_PER_ELEMENT*2,f=n*u,L=GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST,M=n/Float32Array.BYTES_PER_ELEMENT,v=new Float32Array(f/Float32Array.BYTES_PER_ELEMENT);for(let _=u;_--;)v.set([g(-r,r),g(-e,e)],M*_);p=t.CreateBuffer({size:f,usage:L}),t.WriteBuffer(p,v),t.AddVertexBuffers(p)}async function F(){const e=new(await d.Texture()),r=await e.CreateBitmapImage(await(await fetch(Y)).blob(),{colorSpaceConversion:"none"});m=e.CopyImageToTexture(r,{flipY:!0,create:{usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST,format:"rgba8unorm",mipmaps:!1}}),t.AddBindGroups(t.CreateBindGroup(t.CreateBindGroupEntries([e.CreateSampler({magFilter:h.LINEAR,minFilter:h.LINEAR}),m.createView(),{buffer:s}]),1))}function g(e,r){return e===void 0?(e=0,r=1):r===void 0&&(r=e,e=0),Math.random()*(r-e)+e}function A(e){l=requestAnimationFrame(A),!(e-T<o)&&(o?a.fill(0)&&(c=g(a.length)|0):++c===a.length-1&&cancelAnimationFrame(l),T=e,a[c]=1,t.WriteBuffer(s,a),t.Render([S,u]))}x=new ResizeObserver(e=>{for(const r of e){let{inlineSize:n,blockSize:f}=r.contentBoxSize[0];n=n<=960&&n||n-240,t.SetCanvasSize(n,f)}U(),P()}),x.observe(document.body)}function q(){d.OnDeviceLost=()=>{},cancelAnimationFrame(l),x.disconnect(),t.Destroy(),d.Destroy([s,p],m)}export{q as destroy,z as run};
