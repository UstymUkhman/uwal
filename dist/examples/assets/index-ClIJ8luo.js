import{U as u}from"./index-oaqckAdJ.js";import{Q as T}from"./Quad-VFYOTGYq.js";var y="@group(0)@binding(0)var<uniform>resolution: vec2f;fn GetClipSpace(position: vec2f)->vec2f{let clipSpace=position/resolution*2-1;return clipSpace*vec2f(1,-1);}";const E=""+new URL("matrix-Bz2rpV2j.mp4",import.meta.url).href;var R="const ONE_THIRD=1.0/3.0;const RED_BRIGHTNESS=1.2;const BRIGHTNESS=-0.025;const CONTRAST=2.0;struct VertexOutput{@location(0)coord: vec2f,@builtin(position)position: vec4f};@group(0)@binding(2)var Sampler: sampler;@group(0)@binding(1)var<uniform>size: vec2f;@group(0)@binding(3)var Texture: texture_external;@vertex fn vertex(@builtin(vertex_index)index: u32)->VertexOutput {let max=ONE_THIRD*2;var output: VertexOutput;var coord=GetQuadCoord(index);let scale=vec2f(min(resolution.x/size.x,max))*size/resolution;let position=coord*scale-vec2f(0,scale.y);output.position=vec4f(position,0,1);coord=(coord+1.0)*0.5;coord.y=1.0-coord.y;output.coord=coord;return output;}@fragment fn fragment(@location(0)coord: vec2f)->@location(0)vec4f {var color=textureSampleBaseClampToEdge(Texture,Sampler,coord).rgb;color=pow(color,vec3f(0.45));var average=dot(color,vec3f(ONE_THIRD));let weight=smoothstep(0.1,0.25,color.r-average);average=(average-0.5+BRIGHTNESS)*CONTRAST+0.5;color=mix(vec3f(average),vec3f(RED_BRIGHTNESS,0.5,0.5)*color,weight);return vec4f(pow(color,vec3f(2.2)),1);}";/**
 * @example Video Color Grading
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed by using a version listed below.
 * Please note that this code may be simplified in future
 * thanks to more recent library APIs.
 * @version 0.0.6
 * @license MIT
 */let c,d;const e=document.createElement("video");async function w(n){let o;try{o=new(await u.RenderPipeline(n,"Video Color Grading"))}catch(t){alert(t)}let a,l,f,s;const p=new(await u.Texture()),g=p.CreateSampler();e.controls=e.muted=e.loop=!0,e.style.position="absolute",e.preload="auto",e.src=E,o.CreatePipeline({module:o.CreateShaderModule([T,y,R])}),o.CreatePassDescriptor(o.CreateColorAttachment()),e.addEventListener("loadedmetadata",()=>{l=e.videoHeight,a=e.videoWidth,v()},!1),document.body.appendChild(e);function v(){const t=Math.min(n.width/a,.67),r=a*t,i=l*t;e.style.right=`${(n.width-r)/2}px`,e.style.bottom=`${n.height/2}px`,e.style.height=`${i}px`,e.style.width=`${r}px`,e.height=i,e.width=r}async function h(){await x(),S(),c=requestAnimationFrame(m)}function x(){return new Promise((t,r)=>{if(e.addEventListener("error",r),"requestVideoFrameCallback"in e)e.requestVideoFrameCallback(t);else{const i=()=>e.currentTime?t():requestAnimationFrame(i);i()}e.play().catch(r)})}function S(){const t=new Float32Array(2);s=o.CreateBuffer({size:Float32Array.BYTES_PER_ELEMENT*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),t.set([e.videoWidth,e.videoHeight]),o.WriteBuffer(s,t)}function m(){c=requestAnimationFrame(m);const t=p.ImportExternalTexture(e);o.SetBindGroups(o.CreateBindGroup(o.CreateBindGroupEntries([{buffer:f},{buffer:s},g,t]))),o.Render(6)}d=new ResizeObserver(t=>{for(const r of t){const{inlineSize:i,blockSize:C}=r.contentBoxSize[0];o.SetCanvasSize(i,C),f=o.ResolutionBuffer}a&&l&&v(),cancelAnimationFrame(c),h()}),d.observe(n)}function _(){u.OnDeviceLost=()=>{},cancelAnimationFrame(c),d.disconnect(),e.remove(),u.Destroy()}export{_ as destroy,w as run};