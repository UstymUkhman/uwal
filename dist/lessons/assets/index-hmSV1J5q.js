import{D as l}from"./index-BEuvW3M9.js";import{T as f}from"./Triangle.vert-Y1l3LntC.js";var u="@fragment fn fragment(@builtin(position)position: vec4f)->@location(0)vec4f {let red=vec4f(1,0,0,1);let cyan=vec4f(0,1,1,1);let grid=vec2u(position.xy)/8;let checker=(grid.x+grid.y)% 2==1;return select(red,cyan,checker);}";/**
 * @module Inter-stage Variables
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Inter-stage Variables
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-inter-stage-variables.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.4
 * @license MIT
 */(async function(t){let e;try{e=new(await l.RenderPipeline(t,"Checkerboard Triangle"))}catch(r){alert(r)}const n=e.CreatePassDescriptor(e.CreateColorAttachment(void 0,"clear","store",[.3,.3,.3,1])),o=e.CreateShaderModule(f),a=e.CreateShaderModule(u);e.CreatePipeline({vertex:e.CreateVertexState(o),fragment:e.CreateFragmentState(a)});function c(){n.colorAttachments[0].view=e.CurrentTextureView,e.Render(3)}new ResizeObserver(r=>{for(const i of r){const{inlineSize:s,blockSize:d}=i.contentBoxSize[0];e.SetCanvasSize(s,d)}c()}).observe(document.body)})(document.getElementById("lesson"));
