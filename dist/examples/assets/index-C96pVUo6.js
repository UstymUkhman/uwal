import{U as l}from"./index-B6aSTZ5l.js";import{Q as C}from"./Quad-D4MTv-Aj.js";var T=`@group(0) @binding(0) var<uniform> resolution: vec3f;

fn GetClipSpace(position: vec2f) -> vec2f
{
    
    let clipSpace = position / resolution.xy * 2 - 1;

    
    return clipSpace * vec2f(1, -1);
}`;const E=""+new URL("matrix-Bz2rpV2j.mp4",import.meta.url).href;var R=`const ONE_THIRD = 1.0 / 3.0;
const RED_BRIGHTNESS = 1.2;
const BRIGHTNESS = -0.025;
const CONTRAST = 2.0;

struct VertexOutput
{
    @location(0) coord: vec2f,
    @builtin(position) position: vec4f
};

@group(0) @binding(2) var Sampler: sampler;
@group(0) @binding(1) var<uniform> size: vec2f;
@group(0) @binding(3) var Texture: texture_external;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput
{
    let max = ONE_THIRD * 2;
    var output: VertexOutput;
    var coord = GetQuadCoord(index);

    let scale = vec2f(min(resolution.x / size.x, max)) * size / resolution.xy;
    let position = coord * scale - vec2f(0, scale.y);
    output.position = vec4f(position, 0, 1);

    coord = (coord + 1.0) * 0.5;
    coord.y = 1.0 - coord.y;
    output.coord = coord;

    return output;
}

@fragment fn fragment(@location(0) coord: vec2f) -> @location(0) vec4f
{
    
    var color = textureSampleBaseClampToEdge(Texture, Sampler, coord).rgb;

    
    color = pow(color, vec3f(0.45));

    
    var average = dot(color, vec3f(ONE_THIRD));

    
    let weight = smoothstep(0.1, 0.25, color.r - average);

    
    

    
    
    average = (average - 0.5 + BRIGHTNESS) * CONTRAST + 0.5;

    
    color = mix(vec3f(average), vec3f(RED_BRIGHTNESS, 0.5, 0.5) * color, weight);

    
    return vec4f(pow(color, vec3f(2.2)), 1);
}`;/**
 * @example Video Color Grading
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed by using a version listed below.
 * Please note that this code may be simplified in future
 * thanks to more recent library APIs.
 * @version 0.0.6
 * @license MIT
 */let c,u,d;const e=document.createElement("video");let n;async function B(i){try{n=new(await l.RenderPipeline(i,"Video Color Grading"))}catch(t){alert(t)}const f=new(await l.Texture()),x=f.CreateSampler();let a,s,p;e.playsinline=e.loop=!0,e.controls=e.muted=!0,e.style.position="absolute",e.preload="auto",e.src=E,n.CreatePipeline({module:n.CreateShaderModule([C,T,R])}),n.CreatePassDescriptor(n.CreateColorAttachment()),e.addEventListener("loadedmetadata",()=>{s=e.videoHeight,a=e.videoWidth,v()},!1),document.body.appendChild(e);function v(){const t=Math.min(i.width/a,.67),r=a*t,o=s*t;e.style.right=`${(i.width-r)/2}px`,e.style.bottom=`${i.height/2}px`,e.style.height=`${o}px`,e.style.width=`${r}px`,e.height=o,e.width=r}async function h(){await g(),S(),c=requestAnimationFrame(m)}function g(){return new Promise((t,r)=>{if(e.addEventListener("error",r),"requestVideoFrameCallback"in e)e.requestVideoFrameCallback(t);else{const o=()=>e.currentTime?t():requestAnimationFrame(o);o()}e.play().catch(r)})}function S(){const t=new Float32Array(2);u=n.CreateBuffer({size:Float32Array.BYTES_PER_ELEMENT*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),t.set([e.videoWidth,e.videoHeight]),n.WriteBuffer(u,t)}function m(){c=requestAnimationFrame(m);const t=f.ImportExternalTexture(e);n.SetBindGroups(n.CreateBindGroup(n.CreateBindGroupEntries([{buffer:p},{buffer:u},x,t]))),n.Render(6)}d=new ResizeObserver(t=>{for(const r of t){let{inlineSize:o,blockSize:y}=r.contentBoxSize[0];o=o<=960&&o||o-240,n.SetCanvasSize(o,y),p=n.ResolutionBuffer}a&&s&&v(),cancelAnimationFrame(c),h()}),d.observe(document.body)}function _(){l.OnDeviceLost=()=>{},cancelAnimationFrame(c),d.disconnect(),e.remove(),n.Destroy(),l.Destroy(u)}export{_ as destroy,B as run};
