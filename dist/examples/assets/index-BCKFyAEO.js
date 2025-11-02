import{D as a,C as v}from"./index-BRWgv0CZ.js";import{Q as p}from"./Quad-VFYOTGYq.js";var x="struct Screen{color: vec3f,time: f32};struct VertexOutput{@location(0)coord: vec2f,@builtin(position)position: vec4f};@group(0)@binding(0)var<uniform>screen: Screen;@vertex fn vertex(@builtin(vertex_index)index: u32)->VertexOutput {var output: VertexOutput;let coord=GetQuadCoord(index);output.position=vec4f(coord,0,1);output.coord=(coord+1)*0.5;return output;}@fragment fn fragment(@location(0)coord: vec2f)->@location(0)vec4f {let c=screen.color*cos(screen.time);let l=screen.color*length(coord.xy);return vec4f(screen.color+c+l,1);}";/**
 * @example Screen Shader
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is inspired by OGL's "Triangle Screen Shader"
 * {@link https://oframe.github.io/ogl/examples/?src=triangle-screen-shader.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.2.0
 * @license MIT
 */let n,t,f,u;async function y(l){try{t=new(await a.Renderer(l,"Screen Shader"))}catch(e){alert(e)}const o=await t.CreatePipeline([p,x]),{screen:c,buffer:i}=o.CreateUniformBuffer("screen");o.SetBindGroupFromResources(i),c.color.set(new v(23196).rgb),o.SetDrawParams(6),f=i;function s(e){o.WriteBuffer(i,c.time.buffer),n=requestAnimationFrame(s),c.time.set([e*.001]),t.Render()}u=new ResizeObserver(e=>{for(const d of e){let{inlineSize:r,blockSize:m}=d.contentBoxSize[0];r=r<=960&&r||r-240,t.SetCanvasSize(r,m)}cancelAnimationFrame(n),n=requestAnimationFrame(s)}),u.observe(document.body)}function w(){a.OnLost=()=>{},cancelAnimationFrame(n),u.disconnect(),t.Destroy(),a.Destroy(f)}export{w as destroy,y as run};
