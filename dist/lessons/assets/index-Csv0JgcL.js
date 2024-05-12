import{U as l}from"./index-CwSwZyiJ.js";var d="struct VertexOutput{@builtin(position)position: vec4f};@vertex fn vertex(@builtin(vertex_index)index: u32)->VertexOutput {let position=array(vec2f(0.0,0.5),vec2f(-0.5,-0.5),vec2f(0.5,-0.5));var output: VertexOutput;output.position=vec4f(position[index],0.0,1.0);return output;}",f="@fragment fn fragment(@builtin(position)position: vec4f)->@location(0)vec4f {let red=vec4f(1,0,0,1);let cyan=vec4f(0,1,1,1);let grid=vec2u(position.xy)/8;let checker=(grid.x+grid.y)% 2==1;return select(red,cyan,checker);}";/**
 * @module Inter-stage Variables
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Inter-stage Variables
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-inter-stage-variables.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.4
 * @license MIT
 */(async function(t){let e;try{e=new(await l.RenderPipeline(t,"Checkerboard Triangle"))}catch(r){alert(r)}const n=e.CreatePassDescriptor(e.CreateColorAttachment(void 0,"clear","store",[.3,.3,.3,1])),o=e.CreateShaderModule(d),i=e.CreateShaderModule(f);e.CreatePipeline({vertex:e.CreateVertexState(o),fragment:e.CreateFragmentState(i)});function a(){e.SetCanvasSize(t.width,t.height),n.colorAttachments[0].view=e.CurrentTextureView,e.Render(3)}new ResizeObserver(r=>{for(const c of r){const{inlineSize:u,blockSize:s}=c.contentBoxSize[0];e.SetCanvasSize(u,s)}a()}).observe(t)})(document.getElementById("lesson"));
